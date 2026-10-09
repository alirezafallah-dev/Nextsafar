"use client";
import { useState } from "react";
import {
  ChevronDown,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-react";
import type { FlightResult } from "@/lib/api/flights";

const faDigits = (v: string | number) =>
  String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const CABIN_FA: Record<string, string> = {
  economy: "اکونومی",
  business: "تجاری",
  first: "فرست کلاس",
};

function durLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${faDigits(h)}س و ${faDigits(m)}د` : `${faDigits(m)}د`;
}

export default function FlightCard({ flight: f }: { flight: FlightResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ns-card overflow-hidden">
      <div className="p-4 md:p-5 space-y-4">
        {/* ═══ ردیف بالا: ایرلاین + قیمت ═══ */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-lg bg-bg-sec border border-border flex items-center justify-center shrink-0 overflow-hidden">
              {f.airline_logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.airline_logo}
                  alt={f.airline}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Plane className="w-5 h-5 text-primary" />
              )}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-strong truncate">
                {f.airline}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5" dir="ltr">
                {f.flight_number}
              </div>
            </div>
          </div>

          <div className="text-end shrink-0">
            {f.price > 0 ? (
              <>
                <div className="text-base md:text-lg font-extrabold text-primary-dark">
                  {faDigits(f.price.toLocaleString("en-US"))}{" "}
                  <span className="text-[10px] font-bold text-text-muted">
                    تومان
                  </span>
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {CABIN_FA[f.cabin] ?? f.cabin}
                </div>
              </>
            ) : (
              <div className="text-xs font-bold text-text-muted">
                استعلام قیمت
              </div>
            )}
          </div>
        </div>

        {/* ═══ ردیف مسیر: مبدا — مدت — مقصد ═══ */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <PlaneTakeoff className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div
                className="text-base md:text-lg font-extrabold text-text-strong"
                dir="ltr"
              >
                {faDigits(f.depart_time)}
              </div>
              <div className="text-[11px] text-text-muted truncate">
                {f.origin_city} ({f.origin_code})
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center px-1 md:px-3">
            <span className="text-[10px] font-bold text-text-muted mb-1">
              {durLabel(f.duration_min)}
            </span>
            <span className="relative w-16 md:w-28 h-px bg-border">
              <span className="absolute top-1/2 -translate-y-1/2 start-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary-lightest text-primary flex items-center justify-center">
                <Plane className="w-3 h-3" />
              </span>
            </span>
            <span
              className={`text-[10px] font-bold mt-1 ${
                f.stops === 0 ? "text-success" : "text-warning"
              }`}
            >
              {f.stops === 0 ? "مستقیم" : `${faDigits(f.stops)} توقف`}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end min-w-0 text-end">
            <div className="min-w-0">
              <div
                className="text-base md:text-lg font-extrabold text-text-strong"
                dir="ltr"
              >
                {faDigits(f.arrive_time)}
                {f.next_day && (
                  <sup className="text-[9px] text-warning ms-0.5">+۱</sup>
                )}
              </div>
              <div className="text-[11px] text-text-muted truncate">
                {f.dest_city} ({f.dest_code})
              </div>
            </div>
            <PlaneLanding className="w-4 h-4 text-primary shrink-0" />
          </div>
        </div>
      </div>

      {/* ═══ جزئیات بازشو ═══ */}
      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5">
          <div className="border-t border-divider pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>
              <div className="text-text-muted mb-1">کلاس کابین</div>
              <div className="font-bold text-text-strong">
                {CABIN_FA[f.cabin] ?? f.cabin}
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">نوع هواپیما</div>
              <div className="font-bold text-text-strong">
                {f.aircraft || "—"}
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">تاریخ پرواز</div>
              <div className="font-bold text-text-strong">
                {faDigits(f.date)}
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">وضعیت رزرو</div>
              <div className="font-bold text-warning">
                فقط نمایش — به‌زودی
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-divider text-[11px] font-bold text-text-muted hover:text-primary hover:bg-bg-sec transition cursor-pointer"
      >
        {open ? "بستن جزئیات" : "جزئیات پرواز"}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}