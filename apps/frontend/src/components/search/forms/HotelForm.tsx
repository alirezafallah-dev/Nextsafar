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
  todayJalali,
} from "../fields";

interface Props {
  initial?: {
    city?: CityValue | null;
    from?: string;
    to?: string;
    adults?: number;
    kids?: number;
    rooms?: number;
  };
}

export default function HotelForm({ initial }: Props) {
  const router = useRouter();
  const [city, setCity] = useState<CityValue | null>(initial?.city ?? null);
  const [dates, setDates] = useState<DateRangeValue>(
    initial?.from ? { from: initial.from, to: initial.to } : {},
  );
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [kids, setKids] = useState(initial?.kids ?? 0);
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const today = todayJalali();
    if (!city) { setError("شهر یا مقصد را انتخاب کنید"); return; }
    if (!dates.from || !dates.to) { setError("تاریخ ورود و خروج الزامی است"); return; }
    if (dates.from < today) { setError("تاریخ ورود نمی‌تواند در گذشته باشد"); return; }
    if (dates.to <= dates.from) { setError("تاریخ خروج باید بعد از ورود باشد"); return; }

    const p = new URLSearchParams({
      city: city.label,
      checkIn: dates.from,
      checkOut: dates.to,
      adults: String(adults),
      children: String(kids),
      rooms: String(rooms),
    });
    router.push(`/hotels/search?${p.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="شهر / مقصد" className="flex-1 min-w-[180px]">
          {/* ✅ اگه CityPicker منبع "cities" داره، اون رو جایگزین کن */}
        <CityPicker
          source="cities"
          value={city}
          onChange={setCity}
          placeholder="شهر مقصد (مثلاً تهران)"
        />
        </Field>
        <div className="flex-1 min-w-[280px]">
          <DateRangePicker
            value={dates}
            onChange={setDates}
            allowRange
            fromName="تاریخ ورود"
            toName="تاریخ خروج"
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
        <Field label="اتاق" className="w-[100px]">
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="ns-input !h-12"
            aria-label="تعداد اتاق"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
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