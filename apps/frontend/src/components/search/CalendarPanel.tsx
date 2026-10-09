"use client";
import { useMemo, useState } from "react";
import * as faCal from "date-fns-jalali";
import * as enCal from "date-fns";
import { faIR } from "date-fns-jalali/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalRange {
  from: Date | null;
  to: Date | null;
}

const WD_FA = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const WD_EN = ["S", "M", "T", "W", "T", "F", "S"];
const faNum = (n: number) => n.toLocaleString("fa-IR");
const P100 = "#e1f5ff";

function monthCells(m: Date, cal: any, satStart: boolean): (Date | null)[] {
  const start = cal.startOfMonth(m);
  const count = cal.getDate(cal.endOfMonth(m));
  const offset = satStart ? (cal.getDay(start) + 1) % 7 : cal.getDay(start);
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= count; d++) cells.push(cal.setDate(start, d));
  return cells;
}

interface Props {
  mode: "range" | "single";
  initial: CalRange;
  fromName: string;
  toName: string;
  onLiveChange?: (r: CalRange) => void;
  onConfirm: () => void;
  /* ✅ جدید: روزهای قبل از minDate غیرفعال (پیش‌فرض: امروز) */
  minDate?: Date | null;
  /* ✅ جدید: روزهای بعد از maxDate غیرفعال (پیش‌فرض: بدون محدودیت) */
  maxDate?: Date | null;
  /* ✅ جدید: ماهی که تقویم با آن باز می‌شود */
  initialView?: Date | null;
}

export default function CalendarPanel({
  mode,
  initial,
  fromName,
  toName,
  onLiveChange,
  onConfirm,
  minDate,
  maxDate,
  initialView,
}: Props) {
  const [calendar, setCalendar] = useState<"fa" | "en">("fa");
  const [pending, setPending] = useState<CalRange>(initial);
  const [hover, setHover] = useState<Date | null>(null);
  const cal: any = calendar === "fa" ? faCal : enCal;

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  /* ✅ محدوده مجاز: پیش‌فرض همان رفتار قبلی (گذشته غیرفعال) */
  const effMin = minDate ?? today;
  const effMax = maxDate ?? null;

  const [viewMonth, setViewMonth] = useState<Date>(() =>
    faCal.startOfMonth(initialView ?? initial.from ?? effMax ?? new Date()),
  );

  const atMinMonth =
    viewMonth.getTime() <= cal.startOfMonth(effMin).getTime();
  const atMaxMonth = effMax
    ? viewMonth.getTime() >= cal.startOfMonth(effMax).getTime()
    : false;

  const switchCalendar = (c: "fa" | "en") => {
    setCalendar(c);
    const nc: any = c === "fa" ? faCal : enCal;
    setViewMonth(nc.startOfMonth(viewMonth));
  };

  /* ✅ «برو به امروز»: اگه امروز خارج از محدوده است، برو به نزدیک‌ترین روز مجاز */
  const goToday = () =>
    setViewMonth(
      cal.startOfMonth(
        effMax && today.getTime() > effMax.getTime() ? effMax : today,
      ),
    );

  const pick = (day: Date) => {
    let next: CalRange;
    if (mode === "single") {
      next = { from: day, to: null };
    } else if (!pending.from || (pending.from && pending.to)) {
      next = { from: day, to: null };
    } else if (day.getTime() < pending.from.getTime()) {
      next = { from: day, to: null };
    } else {
      next = { from: pending.from, to: day };
    }
    setPending(next);
    onLiveChange?.(next);
  };

  const preview: CalRange = useMemo(() => {
    if (mode !== "range" || !pending.from || pending.to || !hover)
      return pending;
    if (hover.getTime() < pending.from.getTime())
      return { from: hover, to: pending.from };
    return { from: pending.from, to: hover };
  }, [pending, hover, mode]);

  const nights =
    pending.from && pending.to
      ? enCal.differenceInCalendarDays(pending.to, pending.from)
      : 0;

  const canConfirm =
    mode === "single" ? !!pending.from : !!pending.from && !!pending.to;

  const fmtStatus = (d: Date) =>
    calendar === "fa"
      ? faCal.format(d, "d MMMM", { locale: faIR })
      : enCal.format(d, "d MMMM");

  const months = [viewMonth, cal.addMonths(viewMonth, 1)];

  return (
    <div>
      {/* ═══ هدر ═══ */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToday}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
        >
          برو به امروز
        </button>
        <button
          type="button"
          onClick={() => switchCalendar(calendar === "fa" ? "en" : "fa")}
          className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary-600 cursor-pointer"
        >
          {calendar === "fa" ? "تقویم میلادی" : "تقویم شمسی"}
        </button>
      </div>

      {/* ═══ ماه‌ها ═══ */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setViewMonth(cal.addMonths(viewMonth, -1))}
          aria-label="ماه قبل"
          className={`absolute top-2 start-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary-600 cursor-pointer z-10 ${
            atMinMonth ? "invisible" : ""
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewMonth(cal.addMonths(viewMonth, 1))}
          aria-label="ماه بعد"
          className={`absolute top-2 end-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary-600 cursor-pointer z-10 ${
            atMaxMonth ? "invisible" : ""
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {months.map((m, mi) => (
            <div key={mi} className={mi === 1 ? "hidden md:block" : ""}>
              <div className="text-center font-bold text-sm text-text-strong mb-2 h-8 flex items-center justify-center">
                {calendar === "fa"
                  ? faCal.format(m, "MMMM yyyy", { locale: faIR })
                  : enCal.format(m, "MMMM yyyy")}
              </div>
              <div className="grid grid-cols-7">
                {(calendar === "fa" ? WD_FA : WD_EN).map((w, i) => (
                  <div
                    key={i}
                    className="h-7 flex items-center justify-center text-[11px] font-bold text-text-muted"
                  >
                    {w}
                  </div>
                ))}
                {monthCells(m, cal, calendar === "fa").map((d, i) => {
                  if (!d) return <div key={`b${i}`} className="h-9" />;
                  const t = d.getTime();
                  /* ✅ غیرفعال: قبل از minDate یا بعد از maxDate */
                  const isDisabled =
                    t < effMin.getTime() ||
                    (effMax ? t > effMax.getTime() : false);
                  const isToday = t === today.getTime();
                  const isStart =
                    !!preview.from && t === preview.from.getTime();
                  const isEnd = !!preview.to && t === preview.to.getTime();
                  const inRange =
                    !!preview.from &&
                    !!preview.to &&
                    t > preview.from.getTime() &&
                    t < preview.to.getTime();

                  let wrap = "";
                  if (inRange) {
                    wrap = "bg-primary-lightest rounded-lg";
                  } else if (isStart && preview.to) {
                    wrap = `bg-[linear-gradient(to_left,transparent_50%,${P100}_50%)]`;
                  } else if (isEnd) {
                    wrap = `bg-[linear-gradient(to_right,transparent_50%,${P100}_50%)]`;
                  }

                  let btn =
                    "w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors cursor-pointer hover:bg-primary hover:text-white";
                  if (isDisabled) {
                    btn =
                      "w-9 h-9 flex items-center justify-center rounded-md text-sm opacity-35 line-through text-text-muted cursor-not-allowed";
                  } else if (isStart || isEnd) {
                    btn =
                      "w-9 h-9 flex items-center justify-center rounded-md text-sm bg-primary text-white font-bold shadow-sm cursor-pointer";
                  } else if (isToday) {
                    btn =
                      "w-9 h-9 flex items-center justify-center rounded-md text-sm border-2 text-primary-dark font-bold cursor-pointer";
                  }

                  return (
                    <div
                      key={i}
                      className={`h-9 flex items-center justify-center ${wrap}`}
                      onMouseEnter={() => setHover(d)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() => pick(d)}
                        className={btn}
                      >
                        {calendar === "fa"
                          ? faNum(cal.getDate(d))
                          : cal.getDate(d)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ فوتر: وضعیت + تایید ═══ */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-divider">
        <div className="text-xs font-bold text-text-muted leading-6">
          {fromName}{" "}
          <span className="text-text-strong">
            {pending.from ? fmtStatus(pending.from) : "انتخاب کنید"}
          </span>{" "}
          - {toName}{" "}
          <span className="text-text-strong">
            {pending.to ? fmtStatus(pending.to) : "-"}
          </span>
          {mode === "range" && nights > 0 && (
            <span className="text-primary-600">
              {" "}
              - {calendar === "fa" ? faNum(nights) : nights} شب
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className="ns-btn ns-btn-primary ns-btn-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          تایید
        </button>
      </div>
    </div>
  );
}