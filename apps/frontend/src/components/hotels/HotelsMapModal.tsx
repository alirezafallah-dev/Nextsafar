"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Users,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import HotelsMap, { type HotelMapPoint } from "./HotelsMap";
import HotelCard from "./HotelCard";
import HotelSidebar, { type HotelFilters, countActiveFilters } from "./HotelSidebar";
import {
  faDigits,
  hotelKey,
  hotelCoords,
  type UnifiedHotel,
  type HotelQueryInfo,
} from "@/lib/api/hotels";

export default function HotelsMapModal({
  open,
  onClose,
  items,
  nights,
  query,
  filters,
  onFiltersChange,
  priceCeil,
  favCount,
}: {
  open: boolean;
  onClose: () => void;
  items: UnifiedHotel[];
  nights: number;
  query: HotelQueryInfo;
  filters: HotelFilters;
  onFiltersChange: (f: HotelFilters) => void;
  priceCeil: number;
  favCount: number;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // ✅ مودال دوم
  const [refit, setRefit] = useState(0);

  const points: HotelMapPoint[] = useMemo(
    () =>
      items
        .map((i) => {
          const c = hotelCoords(i);
          if (!c) return null;
          return {
            key: hotelKey(i),
            lat: c.lat,
            lng: c.lng,
            title: i.source === "site" ? i.site!.title : i.online!.name,
            price: i.price?.per_night_toman ?? null,
            isSite: i.source === "site",
            href: i.source === "site" ? i.site!.url : i.online!.link || null,
          } as HotelMapPoint;
        })
        .filter(Boolean) as HotelMapPoint[],
    [items],
  );

  if (!open) return null;

  const activeCount = countActiveFilters(filters);

  return (
    <div className="fixed inset-0 z-[900] bg-bg flex flex-col">
      {/* ═══ هدر ═══ */}
      <header className="shrink-0 bg-white border-b border-border px-3 md:px-5 py-3 flex flex-wrap items-center gap-3 md:gap-6">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-bg-sec/60 text-[11px] font-bold text-text-strong hover:border-primary hover:text-primary transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست هتل‌ها
        </button>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[12px] font-bold text-text-strong">
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-primary" />
            هتل‌های {query.city}
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <CalendarDays className="w-4 h-4 text-primary" />
            {faDigits(query.checkIn)} تا {faDigits(query.checkOut)}
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <Users className="w-4 h-4 text-primary" />
            {faDigits(query.adults)} بزرگسال
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRefit((r) => r + 1)}
          title="نمایش همه هتل‌ها روی نقشه"
          className="ms-auto w-10 h-10 rounded-full bg-warning text-white flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* ═══ بدنه: لیست (راست) + نقشه (چپ) ═══ */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* پنل لیست */}
        <aside className="w-full md:w-[46%] lg:w-[42%] flex flex-col min-h-0 border-e border-border bg-bg">
          <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between gap-2 bg-white border-b border-border">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-[11px] font-bold text-text-strong hover:border-primary hover:text-primary transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              فیلترها
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold">
                  {faDigits(activeCount)}
                </span>
              )}
            </button>
            <span className="text-[11px] font-bold text-text-muted">
              {faDigits(items.length)} هتل
            </span>
          </div>

          {/* ✅ لیست همیشه می‌ماند — با همان کارت‌های اصلی */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <HotelCard
                  key={hotelKey(item)}
                  item={item}
                  nights={nights}
                  query={query}
                  onHover={setActiveKey}
                />
              ))}
            </div>
            {items.length === 0 && (
              <div className="py-16 text-center text-xs font-bold text-text-muted">
                هتلی برای نمایش وجود ندارد
              </div>
            )}
          </div>
        </aside>

        {/* نقشه — با زوم اسکرول */}
        <div className="flex-1 min-h-[45%] md:min-h-0 relative">
          <HotelsMap
            points={points}
            activeKey={activeKey}
            height="100%"
            flyOnActive={false}
            refitSignal={refit}
            scrollWheelZoom          // ✅ زوم با اسکرول موس
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ✅ مودال دوم: فیلترها (روی مودال نقشه باز می‌شود)
          ═══════════════════════════════════════════════════════ */}
      {showFilters && (
        <div className="fixed inset-0 z-[980] flex items-center justify-center p-3 md:p-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative w-full max-w-md max-h-[88vh] bg-bg rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-border">
              <span className="text-sm font-extrabold text-text-strong">
                فیلترهای جستجو
              </span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg hover:bg-bg-sec transition cursor-pointer"
                aria-label="بستن فیلترها"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <HotelSidebar
                filters={filters}
                onChange={onFiltersChange}
                points={points}
                activeKey={activeKey}
                priceCeil={priceCeil}
                favCount={favCount}
                showMap={false}
              />
            </div>
            <div className="shrink-0 p-3 bg-white border-t border-border">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="ns-btn ns-btn-primary justify-center w-full !py-3 !text-xs"
              >
                نمایش {faDigits(items.length)} هتل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}