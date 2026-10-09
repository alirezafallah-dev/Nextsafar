"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Search } from "lucide-react";
import {
  CityPicker,
  CityValue,
  DateRangePicker,
  DateRangeValue,
  Field,
  PassengerPicker,
  SwapButton,
  todayJalali,
} from "../fields";

interface Props {
  mode?: "flight" | "tour";
  tripType?: "one" | "round";
  cabin?: string;
  initial?: {
    origin?: CityValue | null;
    dest?: CityValue | null;
    from?: string;
    to?: string;
    adults?: number;
    kids?: number;
  };
}

export default function FlightForm({
  mode = "flight",
  tripType: initTripType = "one",
  cabin: initCabin = "economy",
  initial,
}: Props) {
  const router = useRouter();
  const [tripType, setTripType] = useState<"one" | "round">(initTripType);
  const [cabin, setCabin] = useState(initCabin);
  const [origin, setOrigin] = useState<CityValue | null>(initial?.origin ?? null);
  const [dest, setDest] = useState<CityValue | null>(initial?.dest ?? null);
  const [dates, setDates] = useState<DateRangeValue>(
    initial?.from ? { from: initial.from, to: initial.to } : {},
  );
  const [adults, setAdults] = useState(initial?.adults ?? 1);
  const [kids, setKids] = useState(initial?.kids ?? 0);
  const [error, setError] = useState("");

  /* اگر نوع سفر به یک‌طرفه تغییر کرد، تاریخ برگشت پاک شود */
  useEffect(() => {
    if (tripType === "one") {
      setDates((d) => ({ from: d.from, to: undefined }));
    }
  }, [tripType]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const today = todayJalali();
    if (!origin) { setError("مبدا را انتخاب کنید"); return; }
    if (!dest) { setError("مقصد را انتخاب کنید"); return; }
    if (origin.code && origin.code === dest.code) { setError("مبدا و مقصد یکسان است"); return; }
    if (!dates.from) { setError("تاریخ رفت الزامی است"); return; }
    if (dates.from < today) { setError("تاریخ رفت نمی‌تواند در گذشته باشد"); return; }
    if (tripType === "round") {
      if (!dates.to) { setError("تاریخ برگشت الزامی است"); return; }
      if (dates.to < dates.from) { setError("برگشت نمی‌تواند قبل از رفت باشد"); return; }
    }
    if (adults < 1) { setError("حداقل یک بزرگسال الزامی است"); return; }

    const p = new URLSearchParams({
      tripType,
      cabin,
      origin: origin.label,
      originCode: origin.code || "",
      destination: dest.label,
      destCode: dest.code || "",
      departDate: dates.from,
      adults: String(adults),
      children: String(kids),
    });
    if (tripType === "round" && dates.to) p.set("returnDate", dates.to);
    router.push(`/${mode === "tour" ? "tours" : "flights"}?${p.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {/* ═══ نوع سفر + کابین + راهنما ═══ */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <div className="flex gap-1 bg-bg-sec/60 border border-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTripType("one")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              tripType === "one"
                ? "bg-white text-primary-dark shadow-sm"
                : "text-text-muted hover:text-text-strong"
            }`}
          >
            یک‌طرفه
          </button>
          <button
            type="button"
            onClick={() => setTripType("round")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              tripType === "round"
                ? "bg-white text-primary-dark shadow-sm"
                : "text-text-muted hover:text-text-strong"
            }`}
          >
            رفت و برگشت
          </button>
        </div>

        <select
          value={cabin}
          onChange={(e) => setCabin(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-white text-xs font-bold text-text-strong outline-none focus:border-primary cursor-pointer"
          aria-label="کلاس پرواز"
        >
          <option value="economy">اکونومی</option>
          <option value="business">تجاری</option>
          <option value="first">فرست کلاس</option>
        </select>

        {/* ✅ متن راهنما — جایگزین hint حذف‌شده والد */}
        <span className="ms-auto flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
          <Lightbulb className="w-3.5 h-3.5 text-warning" />
          قیمت‌ها لحظه‌ای استعلام می‌شوند
        </span>
      </div>

      {/* ═══ فیلدها ═══ */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="مبدا" className="flex-1 min-w-[170px]">
          <CityPicker
            source="airports"
            value={origin}
            onChange={setOrigin}
            placeholder="مبدا (شهر / فرودگاه)"
          />
        </Field>
        <SwapButton
          onSwap={() => {
            setOrigin(dest);
            setDest(origin);
          }}
        />
        <Field label="مقصد" className="flex-1 min-w-[170px]">
          <CityPicker
            source="airports"
            value={dest}
            onChange={setDest}
            placeholder="مقصد (شهر / فرودگاه)"
          />
        </Field>
        <div className="flex-1 min-w-[280px]">
          <DateRangePicker
            value={dates}
            onChange={setDates}
            allowRange={tripType === "round"}
            fromName="تاریخ رفت"
            toName="تاریخ برگشت"
          />
        </div>
        <Field label="مسافران" className="w-full md:w-[190px]">
          <PassengerPicker
            adults={adults}
            children={kids}
            onChange={(a, c) => {
              setAdults(a);
              setKids(c);
            }}
          />
        </Field>
        <button
          type="submit"
          className="ns-btn ns-btn-primary h-12 w-full md:w-auto md:min-w-[140px]"
        >
          <Search className="w-4 h-4" />
          جستجو
        </button>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </form>
  );
}