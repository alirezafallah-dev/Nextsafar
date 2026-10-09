"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import * as faCal from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";

/* ═══ محاسبه سن از تاریخ جلالی ═══ */
export function jalaliAge(str: string): number | null {
  const m = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  const now = new Date();
  const jy = faCal.getYear(now);
  const jm = faCal.getMonth(now) + 1;
  const jd = faCal.getDate(now);
  let age = jy - y;
  if (jm < mo || (jm === mo && jd < d)) age--;
  return age;
}

function jalaliToDate(str: string): Date | null {
  const m = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  try {
    let dt = new Date(2000, 0, 1);
    dt = faCal.setYear(dt, parseInt(m[1]));
    dt = faCal.setMonth(dt, parseInt(m[2]) - 1);
    dt = faCal.setDate(dt, parseInt(m[3]));
    return dt;
  } catch {
    return null;
  }
}

function dateToJalali(dt: Date): string {
  const y = faCal.getYear(dt);
  const m = faCal.getMonth(dt) + 1;
  const d = faCal.getDate(dt);
  return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

const MONTHS_FA = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];
const WD_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const faNum = (n: number) => n.toLocaleString("fa-IR");
const POP_H = 400;

/* ═══ استایل مشترک select ها — یکدست با تقویم ═══ */
const SELECT_CLS =
  "h-9 appearance-none rounded-lg border border-border bg-white ps-3 pe-7 text-sm font-bold text-text-strong outline-none focus:border-primary cursor-pointer transition-colors";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function BirthdayPicker({
  value,
  onChange,
  placeholder = "1375/05/01",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  /* ✅ محدوده مجاز: حداقل سن ۱۸ سال */
  const limits = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return { min: faCal.subYears(t, 100), max: faCal.subYears(t, 18) };
  }, []);
  const minMonth = useMemo(() => faCal.startOfMonth(limits.min), [limits]);
  const maxMonth = useMemo(() => faCal.startOfMonth(limits.max), [limits]);

  const parsed = useMemo(() => (value ? jalaliToDate(value) : null), [value]);

  const [view, setView] = useState<Date>(maxMonth);
  useEffect(() => {
    if (open) setView(faCal.startOfMonth(parsed ?? maxMonth));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* ✅ موقعیت هوشمند پاپ‌آپ (Portal — بدون بریدگی) */
  const updatePos = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 16);
    let left = r.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = r.bottom + 8;
    if (top + POP_H > window.innerHeight - 8) {
      top = Math.max(8, r.top - POP_H - 8);
    }
    setPos({ top, left, width });
  };
  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onDown = (e: MouseEvent) => {
      if (
        !wrapRef.current?.contains(e.target as Node) &&
        !popRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const clampMonth = (d: Date) => {
    const t = d.getTime();
    if (t < minMonth.getTime()) return minMonth;
    if (t > maxMonth.getTime()) return maxMonth;
    return d;
  };
  const setYM = (y: number, mIdx: number) => {
    let base = faCal.startOfMonth(view);
    base = faCal.setYear(base, y);
    base = faCal.setMonth(base, mIdx);
    setView(clampMonth(faCal.startOfMonth(base)));
  };
  const nav = (dir: 1 | -1) => setView(clampMonth(faCal.addMonths(view, dir)));

  const viewY = faCal.getYear(view);
  const viewM = faCal.getMonth(view);
  const atMin = view.getTime() <= minMonth.getTime();
  const atMax = view.getTime() >= maxMonth.getTime();

  const years = useMemo(() => {
    const a: number[] = [];
    for (let y = faCal.getYear(maxMonth); y >= faCal.getYear(minMonth); y--)
      a.push(y);
    return a;
  }, [minMonth, maxMonth]);

  /* ═══ تک‌ماه: خانه‌های ماه جاری (شنبه‌شروع) ═══ */
  const cells = useMemo(() => {
    const start = faCal.startOfMonth(view);
    const count = faCal.getDate(faCal.endOfMonth(view));
    const offset = (faCal.getDay(start) + 1) % 7;
    const arr: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= count; d++) arr.push(faCal.setDate(start, d));
    return arr;
  }, [view]);

  const maxT = limits.max.getTime();
  const minT = limits.min.getTime();

  const pick = (day: Date) => {
    onChange(dateToJalali(day));
    setOpen(false);
  };

  /* ✅ FIX: توکن درست نام روز هفته = EEEEE (نه dddd) */
  const selFormatted = parsed
    ? faCal.format(parsed, "EEEE d MMMM yyyy", { locale: faIR })
    : null;

  return (
    <div ref={wrapRef} className="relative">
      {/* ═══ فیلد نمایش ═══ */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ns-input !h-12 text-start flex items-center gap-2 w-full cursor-pointer"
      >
        <CalIcon className="w-4 h-4 text-primary shrink-0" />
        <span
          className={`flex-1 ${value ? "text-text-strong" : "text-text-subtle"}`}
        >
          {value || placeholder}
        </span>
        {value && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-text-muted hover:text-danger cursor-pointer"
          >
            <X className="w-4 h-4" />
          </span>
        )}
      </button>

      {/* ═══ پاپ‌آپ تقویم (Portal) ═══ */}
      {open &&
        pos &&
        createPortal(
          <div
            ref={popRef}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="fixed z-[1200] bg-white rounded-lg border border-border shadow-modal p-4"
          >
            {/* هدر: ناوبری + select های بومی با استایل یکدست */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                type="button"
                onClick={() => nav(-1)}
                disabled={atMin}
                aria-label="ماه قبل"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-lightest hover:text-primary-dark transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {/* select ماه */}
                <div className="relative">
                  <select
                    value={viewM}
                    onChange={(e) => setYM(viewY, parseInt(e.target.value))}
                    className={`${SELECT_CLS} w-28`}
                    aria-label="ماه"
                  >
                    {MONTHS_FA.map((mn, i) => (
                      <option key={mn} value={i}>
                        {mn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                </div>
                {/* select سال */}
                <div className="relative">
                  <select
                    value={viewY}
                    onChange={(e) => setYM(parseInt(e.target.value), viewM)}
                    className={`${SELECT_CLS} w-24`}
                    aria-label="سال"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {faNum(y)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => nav(1)}
                disabled={atMax}
                aria-label="ماه بعد"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-lightest hover:text-primary-dark transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* ═══ گرید تک‌ماه ═══ */}
            <div className="grid grid-cols-7">
              {WD_FA.map((w) => (
                <div
                  key={w}
                  className="h-7 flex items-center justify-center text-[11px] font-bold text-text-muted"
                >
                  {w}
                </div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={`b${i}`} className="h-9" />;
                const t = d.getTime();
                const disabled = t > maxT || t < minT;
                const selected = !!value && dateToJalali(d) === value;
                return (
                  <div key={i} className="h-9 flex items-center justify-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(d)}
                      className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors ${
                        disabled
                          ? "opacity-30 text-text-muted cursor-not-allowed"
                          : selected
                            ? "bg-primary text-white font-bold shadow-sm"
                            : "cursor-pointer hover:bg-primary hover:text-white text-text-strong"
                      }`}
                    >
                      {faNum(faCal.getDate(d))}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* فوتر: نمایش تاریخ انتخاب‌شده — ✅ بدون 0008 */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-divider">
              <span className="text-[11px] font-bold text-text-muted truncate">
                {selFormatted ?? "حداقل سن برای ثبت‌نام ۱۸ سال است"}
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ns-btn ns-btn-primary ns-btn-sm shrink-0"
                >
                  تایید
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}