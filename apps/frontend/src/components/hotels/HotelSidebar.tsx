"use client";

import { useState } from "react";
import {
  ChevronDown,
  Search,
  Star,
  MapPin,
  Heart,
  RotateCcw,
  BedDouble,
  Map,
} from "lucide-react";
import HotelsMap, { type HotelMapPoint } from "./HotelsMap";
import {
  AMENITY_FA,
  compactToman,
  faDigits,
} from "@/lib/api/hotels";

/* ═══════════════════════════════════════════════════════
   تایپ فیلترها
   ═══════════════════════════════════════════════════════ */

export interface HotelFilters {
  q: string;
  stars: number[];
  minRating: number;
  priceMin: number;
  priceMax: number;
  amenities: string[];
  onlySite: boolean;
  onlyFavs: boolean;
}

export const EMPTY_FILTERS: HotelFilters = {
  q: "",
  stars: [],
  minRating: 0,
  priceMin: 0,
  priceMax: 0,
  amenities: [],
  onlySite: false,
  onlyFavs: false,
};

export function countActiveFilters(f: HotelFilters): number {
  let n = 0;
  if (f.q.trim()) n++;
  n += f.stars.length;
  if (f.minRating > 0) n++;
  if (f.priceMin > 0 || f.priceMax > 0) n++;
  n += f.amenities.length;
  if (f.onlySite) n++;
  if (f.onlyFavs) n++;
  return n;
}

const FILTER_AMENITIES = [
  "free_wi_fi",
  "free_parking",
  "pools",
  "spa",
  "fitness_center",
  "restaurant",
  "breakfast_",
  "airport_shuttle",
  "pet_friendly",
  "air_conditioning",
  "room_service",
  "kid_friendly",
];

const RANGE_CSS = `
.ns-range{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:100%;background:transparent;pointer-events:none;margin:0;}
.ns-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;pointer-events:auto;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #0284c7;box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:pointer;}
.ns-range::-moz-range-thumb{pointer-events:auto;width:15px;height:15px;border-radius:50%;background:#fff;border:2px solid #0284c7;cursor:pointer;}
.ns-range::-webkit-slider-runnable-track{background:transparent;}
`;

function Section({
  title,
  children,
  defaultOpen = true,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="px-4 py-3.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-text-strong">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function HotelSidebar({
  filters,
  onChange,
  points,
  activeKey,
  priceCeil,
  favCount,
  onOpenMap,
  showMap = true,
}: {
  filters: HotelFilters;
  onChange: (f: HotelFilters) => void;
  points: HotelMapPoint[];
  activeKey: string | null;
  priceCeil: number;
  favCount: number;
  onOpenMap?: () => void;
  showMap?: boolean;
}) {
  const set = (patch: Partial<HotelFilters>) => onChange({ ...filters, ...patch });

  const max = priceCeil;
  const step = 500_000;
  const vmax = filters.priceMax === 0 ? max : filters.priceMax;
  const pct = (v: number) => (max > 0 ? (v / max) * 100 : 0);

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden divide-y divide-divider shadow-card">
      <style>{RANGE_CSS}</style>

      {/* ═══ نقشه — فقط وقتی showMap فعال باشد ═══ */}
      {showMap && (
        <div className="relative">
          <HotelsMap points={points} activeKey={activeKey} height={210} />
        </div>
      )}

      {/* ═══ دکمه نمایش روی نقشه بزرگ ═══ */}
      {showMap && onOpenMap && (
        <button
          type="button"
          onClick={onOpenMap}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-xs font-bold hover:bg-primary-dark transition cursor-pointer"
        >
          <Map className="w-4 h-4" />
          نمایش روی نقشه بزرگ
        </button>
      )}

      {/* ═══ دکمه پاک کردن ═══ */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-bg-sec/50">
        <span className="text-[11px] font-bold text-text-muted">
          فیلترهای جستجو
        </span>
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          پاک کردن همه
        </button>
      </div>

      {/* ═══ جستجوی نام هتل ═══ */}
      <Section title="نام هتل (فارسی / انگلیسی)" icon={Search}>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
          <input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="مثلاً: گلدن ایج یا Golden Age"
            className="ns-input w-full ps-8 !h-9 !text-xs"
          />
        </div>
      </Section>

      {/* ═══ بازه قیمت ═══ */}
      <Section title="قیمت هر شب (تومان)" icon={BedDouble}>
        <div className="px-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-text-strong mb-3">
            <span>
              {filters.priceMin === 0
                ? "ارزان‌ترین"
                : compactToman(filters.priceMin)}
            </span>
            <span className="text-text-muted">تا</span>
            <span>
              {filters.priceMax === 0 ? "همه" : compactToman(filters.priceMax)}
            </span>
          </div>
          <div className="relative h-5" dir="ltr">
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 rounded-full bg-bg-sec" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-primary"
              style={{ left: `${pct(filters.priceMin)}%`, right: `${100 - pct(vmax)}%` }}
            />
            <input
              type="range"
              className="ns-range"
              min={0}
              max={max}
              step={step}
              value={filters.priceMin}
              style={{ zIndex: filters.priceMin > max - step ? 30 : 20 }}
              onChange={(e) =>
                set({ priceMin: Math.min(Number(e.target.value), vmax - step) })
              }
            />
            <input
              type="range"
              className="ns-range"
              min={0}
              max={max}
              step={step}
              value={vmax}
              style={{ zIndex: 25 }}
              onChange={(e) => {
                const v = Number(e.target.value);
                set({
                  priceMax: v >= max ? 0 : Math.max(v, filters.priceMin + step),
                });
              }}
            />
          </div>
        </div>
      </Section>

      {/* ═══ ستاره هتل ═══ */}
      <Section title="ستاره هتل" icon={Star}>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.stars.includes(s)}
                onChange={() =>
                  set({
                    stars: filters.stars.includes(s)
                      ? filters.stars.filter((x) => x !== s)
                      : [...filters.stars, s],
                  })
                }
                className="w-4 h-4 accent-[#0284c7] cursor-pointer"
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: s }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-warning fill-warning"
                  />
                ))}
              </span>
              <span className="text-[11px] font-bold text-text-muted group-hover:text-text-strong">
                {faDigits(s)} ستاره
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* ═══ امتیاز مهمانان ═══ */}
      <Section title="امتیاز مهمانان" defaultOpen={false}>
        <div className="space-y-1.5">
          {[
            [0, "همه"],
            [4.5, "۴.۵ به بالا (عالی)"],
            [4, "۴ به بالا (خیلی خوب)"],
            [3.5, "۳.۵ به بالا (خوب)"],
          ].map(([v, l]) => (
            <label
              key={String(v)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="ns-min-rating"
                checked={filters.minRating === v}
                onChange={() => set({ minRating: v as number })}
                className="w-4 h-4 accent-[#0284c7] cursor-pointer"
              />
              <span className="text-[11px] font-bold text-text-muted">
                {l as string}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* ═══ امکانات ═══ */}
      <Section title="امکانات هتل" defaultOpen={false}>
        <div className="grid grid-cols-1 gap-1.5">
          {FILTER_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(a)}
                onChange={() =>
                  set({
                    amenities: filters.amenities.includes(a)
                      ? filters.amenities.filter((x) => x !== a)
                      : [...filters.amenities, a],
                  })
                }
                className="w-4 h-4 accent-[#0284c7] cursor-pointer"
              />
              <span className="text-[11px] font-bold text-text-muted">
                {AMENITY_FA[a] ?? a}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* ═══ نوع اقامتگاه ═══ */}
      <Section title="نوع اقامتگاه" defaultOpen={false} icon={MapPin}>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <span className="text-[11px] font-bold text-text-strong">
              فقط هتل‌های سفر بعدی
            </span>
            <input
              type="checkbox"
              checked={filters.onlySite}
              onChange={(e) => set({ onlySite: e.target.checked })}
              className="w-4 h-4 accent-[#0284c7] cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-text-strong">
              <Heart
                className={`w-3.5 h-3.5 ${favCount > 0 ? "text-danger fill-danger" : "text-text-muted"}`}
              />
              فقط علاقه‌مندی‌ها
              {favCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-danger/10 text-danger text-[10px] font-bold">
                  {faDigits(favCount)}
                </span>
              )}
            </span>
            <input
              type="checkbox"
              checked={filters.onlyFavs}
              onChange={(e) => set({ onlyFavs: e.target.checked })}
              className="w-4 h-4 accent-[#0284c7] cursor-pointer"
            />
          </label>
        </div>
      </Section>
    </div>
  );
}