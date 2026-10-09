"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as faCal from "date-fns-jalali";
import { isValid } from "date-fns-jalali";
import { differenceInCalendarDays } from "date-fns";
import {
  ArrowLeftRight,
  Calendar as CalendarIcon,
  ChevronDown,
  MapPin,
  Minus,
  Plane,
  Plus,
  Users,
} from "lucide-react";
import { createPortal } from "react-dom";
import CalendarPanel, { CalRange } from "@/components/search/CalendarPanel";

/* ═══════════════════════════════════════════════════════════════
   تبدیل تاریخ: Date ↔ "YYYY/MM/DD" شمسی
═══════════════════════════════════════════════════════════════ */
const JALALI_FMT = "yyyy/MM/dd";

export function parseJalaliDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  try {
    const d = faCal.parse(s, JALALI_FMT, new Date());
    return isValid(d) ? d : undefined;
  } catch {
    return undefined;
  }
}

export function formatJalaliDate(d: Date | undefined): string {
  if (!d || !isValid(d)) return "";
  return faCal.format(d, JALALI_FMT);
}

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayJalali(): string {
  return formatJalaliDate(todayStart());
}

/* ═══════════════════════════════════════════════════════════════
   Field wrapper
═══════════════════════════════════════════════════════════════ */
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TripTypeToggle — یک‌طرفه / رفت و برگشت
═══════════════════════════════════════════════════════════════ */
export function TripTypeToggle({
  value,
  onChange,
}: {
  value: "one" | "round";
  onChange: (v: "one" | "round") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-bg-sec p-2 gap-1">
      {(
        [
          ["one", "یک‌طرفه"],
          ["round", "رفت و برگشت"],
        ] as const
      ).map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
            value === v
              ? "bg-white text-primary-600 shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PassengerPicker — بزرگسال + کودک
═══════════════════════════════════════════════════════════════ */
export function PassengerPicker({
  adults,
  children: kids,
  onChange,
}: {
  adults: number;
  children: number;
  onChange: (a: number, c: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const label =
    kids > 0
      ? `${adults.toLocaleString("fa-IR")} بزرگسال، ${kids.toLocaleString("fa-IR")} کودک`
      : `${adults.toLocaleString("fa-IR")} مسافر`;

  const Counter = ({
    title,
    sub,
    value,
    min,
    max,
    set,
  }: {
    title: string;
    sub: string;
    value: number;
    min: number;
    max: number;
    set: (v: number) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-text-muted">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => set(value - 1)}
          className="w-8 h-8 rounded-md border border-border flex items-center justify-center disabled:opacity-40 hover:border-primary-500 hover:text-primary-600 cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-5 text-center font-bold">
          {value.toLocaleString("fa-IR")}
        </span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => set(value + 1)}
          className="w-8 h-8 rounded-md border border-border flex items-center justify-center disabled:opacity-40 hover:border-primary-500 hover:text-primary-600 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ns-input w-full flex items-center justify-between gap-2 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-500" />
          {label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute top-full end-0 mt-2 w-64 bg-white rounded-lg border border-border shadow-card-hover p-4 z-40">
          <Counter
            title="بزرگسال"
            sub="۱ سال به بالا"
            value={adults}
            min={1}
            max={9}
            set={(v) => onChange(v, kids)}
          />
          <div className="h-px bg-divider my-1" />
          <Counter
            title="کودک"
            sub="۲ تا ۱۲ سال"
            value={kids}
            min={0}
            max={6}
            set={(v) => onChange(adults, v)}
          />
        </div>
      )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════
   📅 DateRangePicker — سبک Booking / علی‌بابا
   • دو اینپوت جداگانه (رفت / برگشت)
   • پاپ‌آپ با CalendarPanel
   • ثبت زنده تاریخ + دکمه تایید
   • ✅ بدون Hydration Mismatch
═══════════════════════════════════════════════════════════════ */
export interface DateRangeValue {
  from?: string; // YYYY/MM/DD شمسی
  to?: string; // YYYY/MM/DD شمسی
}

export function DateRangePicker({
  value,
  onChange,
  allowRange = true,
  disabled = false,
  fromName = "ورود",
  toName = "خروج",
  hideReturnField = false,
}: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  allowRange?: boolean;
  disabled?: boolean;
  fromName?: string;
  toName?: string;
  hideReturnField?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ─── بستن با کلیک بیرون ─── */
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  /* ─── ⭐ وسط‌چین + نگه‌داشتن داخل viewport ─── */
  useEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const measure = () => {
      const container = ref.current;
      const panel = panelRef.current;
      if (!container || !panel) return;

      const cRect = container.getBoundingClientRect();
      const width = panel.offsetWidth;
      const margin = 8;

      // موقعیت ایده‌آل: وسط کانتینر
      const idealLeft = cRect.left + cRect.width / 2 - width / 2;

      // clamp به viewport
      const clampedLeft = Math.max(
        margin,
        Math.min(idealLeft, window.innerWidth - margin - width),
      );

      // اختلاف = مقدار شیفت لازم
      setShift(clampedLeft - idealLeft);
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [open, session]);

  const openPopup = useCallback(() => {
    setSession((s) => s + 1);
    setOpen(true);
  }, []);

  const liveUpdate = useCallback(
    (r: CalRange) => {
      onChange({
        from: r.from ? formatJalaliDate(r.from) : undefined,
        to: r.to ? formatJalaliDate(r.to) : undefined,
      });
    },
    [onChange],
  );

  const confirm = useCallback(() => setOpen(false), []);

  const isDisabledFrom = disabled;
  const isDisabledTo = disabled || !allowRange;

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex gap-2">
        {/* ═══ اینپوت تاریخ رفت ═══ */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-text-muted block mb-1.5">
            {fromName}
          </span>
          <button
            type="button"
            disabled={mounted ? isDisabledFrom || undefined : undefined}
            onClick={openPopup}
            className={`ns-input w-full flex items-center justify-between gap-2 cursor-pointer text-start ${
              isDisabledFrom ? "bg-bg-sec cursor-not-allowed" : ""
            }`}
          >
            <span
              className={
                value.from ? "text-text truncate" : "text-text-subtle truncate"
              }
            >
              {value.from || "انتخاب کنید"}
            </span>
            <CalendarIcon className="w-4 h-4 text-primary-500 shrink-0" />
          </button>
        </div>

        {/* ═══ اینپوت تاریخ برگشت — فقط اگه مخفی نشده باشه ═══ */}
        {!hideReturnField && (
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-text-muted block mb-1.5">
              {toName}
            </span>
            <button
              type="button"
              disabled={mounted ? isDisabledTo || undefined : undefined}
              onClick={openPopup}
              className={`ns-input w-full flex items-center justify-between gap-2 cursor-pointer text-start ${
                isDisabledTo ? "bg-bg-sec cursor-not-allowed" : ""
              }`}
            >
              <span
                className={
                  value.to ? "text-text truncate" : "text-text-subtle truncate"
                }
              >
                {value.to || (allowRange ? "انتخاب کنید" : "—")}
              </span>
              <CalendarIcon className="w-4 h-4 text-primary-500 shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* ═══ ⭐ پاپ‌آپ: وسط هر دو اینپوت + clamp به صفحه ═══ */}
      {open && (
        <div
          ref={panelRef}
          style={{
            left: "50%",
            transform: `translateX(calc(-50% + ${shift}px))`,
          }}
          className="absolute top-full mt-2 z-50 bg-white rounded-lg border border-border shadow-card-hover p-4 w-[320px] md:w-[620px]"
        >
          <CalendarPanel
            key={session}
            mode={allowRange ? "range" : "single"}
            initial={{
              from: parseJalaliDate(value.from) ?? null,
              to: parseJalaliDate(value.to) ?? null,
            }}
            fromName={fromName}
            toName={toName}
            onLiveChange={liveUpdate}
            onConfirm={confirm}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CityPicker — با دیتاست JSON + جستجوی وردپرس (fallback)
═══════════════════════════════════════════════════════════════ */
export interface CityValue {
  label: string;
  code?: string;
  sub?: string;
}

const WP =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

let airportsCache: CityValue[] | null = null;
let citiesCache: CityValue[] | null = null;

async function loadAirports(): Promise<CityValue[]> {
  if (airportsCache) return airportsCache;
  try {
    const res = await fetch("/data/airports.json");
    if (!res.ok) throw new Error("Failed to load airports");
    const data: any[] = await res.json();
    airportsCache = data.map((a) => ({
      label: `${a.name_fa} (${a.iata})`,
      code: a.iata,
      sub: `${a.city_fa}، ${a.country_fa}`,
    }));
    return airportsCache!;
  } catch {
    airportsCache = [];
    return [];
  }
}

async function loadCities(): Promise<CityValue[]> {
  if (citiesCache) return citiesCache;
  try {
    const res = await fetch("/data/cities.json");
    if (!res.ok) throw new Error("Failed to load cities");
    const data: any[] = await res.json();
    citiesCache = data.map((c) => ({
      label: c.name_fa,
      sub: c.country_fa,
    }));
    return citiesCache!;
  } catch {
    citiesCache = [];
    return [];
  }
}

/* ═══ حذف تکراری‌ها: اولویت با اولین وقوع (آیتم سایت اول است) ═══ */
function dedupeCities(list: CityValue[]): CityValue[] {
  const seen = new Set<string>();
  const out: CityValue[] = [];
  for (const item of list) {
    const key = item.label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function CityPicker({
  value,
  onChange,
  placeholder,
  source,
}: {
  value: CityValue | null;
  onChange: (v: CityValue) => void;
  placeholder: string;
  source: "airports" | "cities";
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [allItems, setAllItems] = useState<CityValue[]>([]);
  const [wpItems, setWpItems] = useState<CityValue[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // لود دیتاست اولیه
  useEffect(() => {
    (source === "airports" ? loadAirports() : loadCities()).then(setAllItems);
  }, [source]);

  // جستجوی وردپرس (fallback)
  useEffect(() => {
    if (!open || q.length < 2) {
      setWpItems([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const ep = source === "airports" ? "airport" : "tourism";
        const res = await fetch(
          `${WP}/wp/v2/${ep}?search=${encodeURIComponent(
            q,
          )}&per_page=6&_fields=id,title,name,slug`,
        );
        if (!res.ok) throw 0;
        const data = await res.json();
        setWpItems(
          data.map((p: any) => ({
            label: decodeURIComponent(
              String(p.title?.rendered || p.name || "")
                .replace(/<[^>]+>/g, "")
                .trim(),
            ),
            code: decodeURIComponent(p.slug),
            sub: "از سایت",
          })),
        );
      } catch {
        setWpItems([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, source, open]);

  // بستن با کلیک بیرون
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // فیلتر محلی
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    /* ✅ سایت اول، سپس دیتاست — و حذف تکراری‌ها */
    const list = dedupeCities([...wpItems, ...allItems]);
    if (!term) return list.slice(0, 50);
    return list
      .filter(
        (i) =>
          i.label.toLowerCase().includes(term) ||
          i.code?.toLowerCase().includes(term) ||
          i.sub?.toLowerCase().includes(term),
      )
      .slice(0, 50);
  }, [q, allItems, wpItems]);

  const Icon = source === "airports" ? Plane : MapPin;

  return (
    <div ref={ref} className="relative w-full">
      <Icon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
      <input
        className="ns-input w-full ps-9"
        placeholder={placeholder}
        value={open ? q : value?.label || ""}
        onFocus={() => {
          setOpen(true);
          setQ("");
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <ul className="absolute top-full inset-x-0 mt-2 bg-white rounded-lg border border-border shadow-card-hover overflow-hidden z-40 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-text-muted text-center">
              نتیجه‌ای یافت نشد
            </li>
          ) : (
            filtered.map((o, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-600 cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{o.label}</span>
                    {o.sub && (
                      <span className="text-xs text-text-subtle truncate">
                        {o.sub}
                      </span>
                    )}
                  </div>
                  {o.code && (
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded shrink-0">
                      {o.code}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SwapButton — جابجایی مبدا و مقصد
═══════════════════════════════════════════════════════════════ */
export function SwapButton({ onSwap }: { onSwap: () => void }) {
  return (
    <button
      type="button"
      onClick={onSwap}
      aria-label="جابجایی مبدا و مقصد"
      className="self-end mb-0.5 w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-primary-600 hover:bg-primary-50 hover:rotate-180 transition-all cursor-pointer shrink-0"
    >
      <ArrowLeftRight className="w-4 h-4" />
    </button>
  );
}
/* ═══════════════════════════════════════════════════════════════
📅 SingleDatePicker — فقط یک تاریخ (بدون برگشت)
• مخصوص برنامه سفر AI
• ✅ FIX: استفاده از React Portal برای جلوگیری از کلیپ شدن در مودال
• یک اینپوت + پاپ‌آپ CalendarPanel با mode="single"
═══════════════════════════════════════════════════════════════ */
export function SingleDatePicker({
  value,
  onChange,
  label = "تاریخ",
  placeholder = "انتخاب کنید",
  disabled = false,
}: {
  value?: string; // YYYY/MM/DD شمسی
  onChange: (v: string | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ═══ محاسبه موقعیت پنل (position: fixed) ═══ */
  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    const update = () => {
      const container = ref.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();

      /* ✅ FIX: عرض واکنش‌گرا — موبایل ۳۲۰ / دسکتاپ ۶۲۰ */
      const isDesktop = window.innerWidth >= 768;
      const panelWidth = isDesktop ? 620 : 320;
      const panelHeight = isDesktop ? 460 : 440;
      const margin = 8;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      /* اگر پایین جا نیست، بالای فیلد باز شو */
      const openBelow = cRect.bottom + panelHeight + margin < vh;
      const top = openBelow
        ? cRect.bottom + margin
        : Math.max(margin, cRect.top - panelHeight - margin);

      /* وسط‌چین فیلد + clamp به viewport */
      const idealLeft = cRect.left + cRect.width / 2 - panelWidth / 2;
      const left = Math.max(margin, Math.min(idealLeft, vw - margin - panelWidth));

      setPos({ top, left, width: panelWidth });
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true); // ✅ true = capture phase (اسکرول داخل مودال هم)
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, session]);

  /* ═══ بستن با کلیک بیرون (شامل کلیک داخل پنل) ═══ */
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return; // ✅ کلیک داخل تقویم نبندد
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const openPopup = useCallback(() => {
    setSession((s) => s + 1);
    setOpen(true);
  }, []);

  const liveUpdate = useCallback(
    (r: CalRange) => {
      onChange(r.from ? formatJalaliDate(r.from) : undefined);
    },
    [onChange],
  );

  const confirm = useCallback(() => setOpen(false), []);

  return (
    <div ref={ref} className="relative w-full">
      <span className="text-xs font-semibold text-text-muted block mb-1.5">
        {label}
      </span>
      <button
        type="button"
        disabled={mounted ? disabled || undefined : undefined}
        onClick={openPopup}
        className={`ns-input w-full flex items-center justify-between gap-2 cursor-pointer text-start ${
          disabled ? "bg-bg-sec cursor-not-allowed" : ""
        }`}
      >
        <span
          className={value ? "text-text truncate" : "text-text-subtle truncate"}
        >
          {value || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-primary-500 shrink-0" />
      </button>

      {/* ═══ Portal: پنل تقویم روی body رندر می‌شود ═══ */}
      {open &&
        pos &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxWidth: "calc(100vw - 16px)",   // ✅ اضافه شد
              zIndex: 9999,
            }}
            className="bg-white rounded-lg border border-border shadow-card-hover p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CalendarPanel
              key={session}
              mode="single"
              initial={{
                from: parseJalaliDate(value) ?? null,
                to: null,
              }}
              fromName={label}
              toName=""
              onLiveChange={liveUpdate}
              onConfirm={confirm}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════
   کمکی: محاسبه تعداد شب‌ها بین دو تاریخ
═══════════════════════════════════════════════════════════════ */
export function calcNights(from?: string, to?: string): number | null {
  if (!from || !to) return null;
  const f = parseJalaliDate(from);
  const t = parseJalaliDate(to);
  if (!f || !t) return null;
  const diff = differenceInCalendarDays(t, f);
  return diff > 0 ? diff : null;
}
