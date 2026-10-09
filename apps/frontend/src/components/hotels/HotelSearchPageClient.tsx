"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BedDouble, Info, SlidersHorizontal, TrendingDown,
  Star, Sparkles, AlertTriangle, MessageSquare, X,
} from "lucide-react";
import HotelForm from "@/components/search/forms/HotelForm";
import HotelCard from "./HotelCard";
import HotelSidebar, {
  type HotelFilters, EMPTY_FILTERS, countActiveFilters,
} from "./HotelSidebar";
import HotelsMapModal from "./HotelsMapModal";
import type { HotelMapPoint } from "./HotelsMap";
import { useFavorites, pullFromServer } from "@/lib/favorites";
import {
  hotelKey, hotelNames, hotelStars, hotelRating, hotelReviews,
  hotelAmenities, hotelCoords, faDigits,
  type HotelsSearchResult, type UnifiedHotel, type HotelQueryInfo,
} from "@/lib/api/hotels";

interface Params {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

const SORTS = [
  { key: "recommended", label: "پیشنهادی", icon: Sparkles },
  { key: "cheapest", label: "ارزان‌ترین", icon: TrendingDown },
  { key: "rating", label: "بالاترین امتیاز", icon: Star },
  { key: "reviews", label: "بیشترین نظر", icon: MessageSquare },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

// ✅ آرایه خالی ثابت برای جلوگیری از reference جدید در هر رندر
const EMPTY_ITEMS: UnifiedHotel[] = [];

export default function HotelSearchPageClient({
  params,
  result,
  isResults,
}: {
  params: Params;
  result: HotelsSearchResult | null;
  isResults: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filters, setFilters] = useState<HotelFilters>(EMPTY_FILTERS);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const { favs } = useFavorites();

  // ✅ stable reference
  const items = result?.items ?? EMPTY_ITEMS;
  const nights = result?.meta?.nights ?? 0;

  const query: HotelQueryInfo = {
    city: params.city,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults,
  };

  const priceCeil = useMemo(() => {
    const prices = items
      .map((i) => i.price?.per_night_toman ?? 0)
      .filter((p) => p > 0);
    if (!prices.length) return 50_000_000;
    return Math.ceil(Math.max(...prices) / 5_000_000) * 5_000_000;
  }, [items]);

  // ✅ pullFromServer خودش guard دارد — حتی با reload، فقط یکبار pull می‌کند
  useEffect(() => {
    pullFromServer();
  }, []);
  
  /* ═══ اعمال فیلترها ═══ */
  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = [...items];

    list = list.filter(
      (i) => !(i.source === "site" && (i.price?.per_night_toman ?? 0) <= 0),
    );

    if (q) {
      list = list.filter((i) =>
        hotelNames(i).some((n) => n.toLowerCase().includes(q)),
      );
    }
    if (filters.onlySite) list = list.filter((i) => i.source === "site");
    if (filters.onlyFavs)
      list = list.filter((i) => favs.includes(hotelKey(i)));
    if (filters.stars.length) {
      list = list.filter((i) => {
        const s = hotelStars(i);
        return s > 0 && filters.stars.includes(s);
      });
    }
    if (filters.minRating > 0) {
      list = list.filter((i) => hotelRating(i) >= filters.minRating);
    }
    if (filters.priceMin > 0 || filters.priceMax > 0) {
      list = list.filter((i) => {
        const p = i.price?.per_night_toman ?? 0;
        if (p <= 0) return false;
        if (p < filters.priceMin) return false;
        if (filters.priceMax > 0 && p > filters.priceMax) return false;
        return true;
      });
    }
    if (filters.amenities.length) {
      list = list.filter((i) => {
        const am = hotelAmenities(i);
        return filters.amenities.every((a) => am.includes(a));
      });
    }

    /* ═══ مرتب‌سازی ═══ */
    if (sort === "cheapest") {
      list.sort((a, b) => {
        const pa = a.price?.per_night_toman || Infinity;
        const pb = b.price?.per_night_toman || Infinity;
        return pa - pb;
      });
    } else if (sort === "rating") {
      list.sort((a, b) => hotelRating(b) - hotelRating(a));
    } else if (sort === "reviews") {
      list.sort((a, b) => hotelReviews(b) - hotelReviews(a));
    } else {
      list.sort((a, b) => {
        const score = (i: UnifiedHotel) => {
          const site = i.source === "site" ? 100 : 0;
          const feat = i.badges.includes("featured") ? 50 : 0;
          const matched = i.match_confidence !== null ? 30 : 0;
          return site + feat + matched + hotelRating(i);
        };
        return score(b) - score(a);
      });
    }
    return list;
  }, [items, filters, sort, favs]);

  /* ═══ نقاط نقشه ═══ */
  const mapPoints: HotelMapPoint[] = useMemo(
    () =>
      filtered
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
    [filtered],
  );

  const activeCount = countActiveFilters(filters);

  const sidebar = (
    <HotelSidebar
      filters={filters}
      onChange={setFilters}
      points={mapPoints}
      activeKey={activeKey}
      priceCeil={priceCeil}
      favCount={favs.length}
      onOpenMap={() => {
        setMobileSidebar(false);
        setMapModal(true);
      }}
    />
  );

  return (
    <div className="ns-container py-6 md:py-8 space-y-5">
      {/* ═══ فرم جستجو ═══ */}
      <section className="rounded-lg border border-border bg-white shadow-card p-4 md:p-5">
        {!isResults && (
          <div className="mb-4">
            <h1 className="text-lg md:text-xl font-extrabold text-text-strong">
              جستجوی هتل
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-1">
              هتل‌های سفر بعدی + هزاران هتل دیگر، با قیمت لحظه‌ای.
            </p>
          </div>
        )}
        <HotelForm
          key={`${params.city}-${params.checkIn}-${params.checkOut}-${params.adults}-${params.rooms}`}
          initial={{
            city: params.city ? { label: params.city } : null,
            from: params.checkIn || undefined,
            to: params.checkOut || undefined,
            adults: params.adults,
            kids: params.children,
            rooms: params.rooms,
          }}
        />
      </section>

      {isResults && (
        <>
          {result?.meta?.stale && (
            <div className="flex items-start gap-2.5 rounded-lg bg-warning/10 border border-warning/20 px-4 py-3 text-xs text-text-strong leading-6">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>
                دریافت قیمت لحظه‌ای ممکن نشد؛ قیمت‌های نمایش‌داده‌شده ممکن است
                به‌روز نباشند.
              </span>
            </div>
          )}

          {result === null ? (
            <div className="rounded-lg border-2 border-dashed border-border bg-bg-sec/30 p-10 text-center">
              <BedDouble className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-extrabold text-text-strong mb-1">
                خطا در دریافت نتایج
              </h3>
              <p className="text-xs text-text-muted">
                لطفاً دوباره تلاش کنید یا تاریخ/شهر را تغییر دهید.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* ═══ سایدبار دسکتاپ ═══ */}
              <aside className="hidden lg:block w-80 shrink-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                {sidebar}
              </aside>

              {/* ═══ سایدبار موبایل ═══ */}
              {mobileSidebar && (
                <div className="fixed inset-0 z-[600] lg:hidden">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileSidebar(false)}
                  />
                  <div className="absolute inset-y-0 start-0 w-[85%] max-w-sm overflow-y-auto bg-bg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold">
                        نقشه و فیلترها
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileSidebar(false)}
                        className="p-2 rounded-lg hover:bg-bg-sec cursor-pointer"
                        aria-label="بستن"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {sidebar}
                  </div>
                </div>
              )}

              {/* ═══ نتایج ═══ */}
              <main className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-base md:text-lg font-extrabold text-text-strong">
                      هتل‌های {params.city}
                    </h1>
                    <p className="text-[11px] text-text-muted mt-1">
                      {faDigits(params.checkIn)} تا {faDigits(params.checkOut)}{" "}
                      • {faDigits(nights)} شب • {faDigits(params.adults)} بزرگسال
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setMobileSidebar(true)}
                      className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-[11px] font-bold text-text-strong cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      نقشه و فیلترها
                      {activeCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold">
                          {faDigits(activeCount)}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-1 overflow-x-auto">
                      {SORTS.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setSort(s.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                            sort === s.key
                              ? "bg-primary text-white shadow-sm"
                              : "text-text-muted hover:text-text-strong"
                          }`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg bg-info/10 border border-info/20 px-4 py-3 text-xs text-text-strong leading-6">
                  <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                  <span>
                    قیمت‌ها به‌صورت لحظه‌ای استعلام می‌شوند؛ هتل‌های «سفر بعدی»
                    صفحه اختصاصی با جزئیات کامل دارند.
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-border bg-bg-sec/30 p-10 text-center">
                    <BedDouble className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-extrabold text-text-strong mb-1">
                      هتلی با این فیلترها پیدا نشد
                    </h3>
                    <p className="text-xs text-text-muted">
                      فیلترها را تغییر دهید یا پاک کنید.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filtered.map((item) => (
                      <HotelCard
                        key={hotelKey(item)}
                        item={item}
                        nights={nights}
                        query={query}
                        onHover={setActiveKey}
                      />
                    ))}
                  </div>
                )}
              </main>
            </div>
          )}
        </>
      )}

      {/* ═══ مودال نقشه ═══ */}
      <HotelsMapModal
        open={mapModal}
        onClose={() => setMapModal(false)}
        items={filtered}
        nights={nights}
        query={query}
        filters={filters}
        onFiltersChange={setFilters}
        priceCeil={priceCeil}
        favCount={favs.length}
      />
    </div>
  );
}