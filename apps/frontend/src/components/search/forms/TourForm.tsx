"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

export default function TourForm({ cabin = "economy" }: { cabin?: string }) {
  const router = useRouter();
  const [origin, setOrigin] = useState<CityValue | null>(null);
  const [dest, setDest] = useState<CityValue | null>(null);
  const [dates, setDates] = useState<DateRangeValue>({});
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = todayJalali();
    const errs: string[] = [];

    if (!origin) errs.push("مبدا را انتخاب کنید");
    if (!dest) errs.push("مقصد را انتخاب کنید");
    if (origin && dest && origin.code === dest.code)
      errs.push("مبدا و مقصد یکسان است");
    if (!dates.from) errs.push("تاریخ رفت الزامی است");
    else if (dates.from < today) errs.push("تاریخ رفت نمی‌تواند در گذشته باشد");
    if (!dates.to) errs.push("تاریخ برگشت الزامی است");
    else if (dates.from && dates.to <= dates.from)
      errs.push("برگشت نمی‌تواند قبل از رفت باشد");
    if (adults < 1) errs.push("حداقل یک بزرگسال الزامی است");

    if (errs.length) {
      setError(errs[0]);
      return;
    }
    setError("");

    const p = new URLSearchParams({
      cabin,
      origin: origin!.label,
      originCode: origin!.code || "",
      destination: dest!.label,
      destCode: dest!.code || "",
      departDate: dates.from!,
      returnDate: dates.to!,
      adults: String(adults),
      children: String(kids),
    });
    router.push(`/tours?${p.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
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
            allowRange={true}
            fromName="تاریخ رفت"
            toName="تاریخ برگشت"
          />
        </div>

        {/* ✅ موبایل: تمام‌عرض / دسکتاپ: عرض ثابت */}
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

        {/* ✅ موبایل: تمام‌عرض / دسکتاپ: inline */}
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