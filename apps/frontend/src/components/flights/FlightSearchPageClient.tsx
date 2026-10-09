"use client";
import { useMemo, useState } from "react";
import { Info, TrendingDown, Clock3, Timer, Search } from "lucide-react";
import FlightForm from "@/components/search/forms/FlightForm";
import FlightCard from "./FlightCard";
import type { FlightResult } from "@/lib/api/flights";

interface Params {
  origin: string;
  originCode: string;
  destination: string;
  destCode: string;
  departDate: string;
  returnDate: string;
  tripType: "one" | "round";
  cabin: string;
  adults: number;
  children: number;
}

const CABIN_FA: Record<string, string> = {
  economy: "اکونومی",
  business: "تجاری",
  first: "فرست کلاس",
};

const SORTS = [
  { key: "earliest", label: "زودترین پرواز", icon: Clock3 },
  { key: "cheapest", label: "ارزان‌ترین", icon: TrendingDown },
  { key: "shortest", label: "کوتاه‌ترین مدت", icon: Timer },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

const faDigits = (v: string | number) =>
  String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function FlightSearchPageClient({
  params,
  outbound,
  inbound,
  isResults,
}: {
  params: Params;
  outbound: FlightResult[];
  inbound: FlightResult[];
  isResults: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("earliest");

  const sorted = useMemo(() => {
    const fn = (a: FlightResult, b: FlightResult) =>
      sort === "cheapest"
        ? (a.price || Infinity) - (b.price || Infinity)
        : sort === "shortest"
          ? a.duration_min - b.duration_min
          : a.depart_time.localeCompare(b.depart_time);
    return { out: [...outbound].sort(fn), inn: [...inbound].sort(fn) };
  }, [sort, outbound, inbound]);

  const renderList = (title: string, items: FlightResult[]) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base md:text-lg font-extrabold text-text-strong">
          {title}
        </h2>
        <span className="text-[11px] font-bold text-text-muted">
          {faDigits(items.length)} پرواز
        </span>
      </div>
      {items.length > 0 ? (
        items.map((f) => <FlightCard key={f.id} flight={f} />)
      ) : (
        <div className="rounded-lg border-2 border-dashed border-border bg-bg-sec/30 p-10 text-center">
          <Search className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-extrabold text-text-strong mb-1">
            پروازی در این تاریخ پیدا نشد
          </h3>
          <p className="text-xs text-text-muted">
            تاریخ یا مسیر جستجو را تغییر دهید.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <div className="ns-container py-6 md:py-10 space-y-6">
      {/* ═══ فرم جستجو ═══ */}
      <section
        id="flight-form"
        className="rounded-lg border border-border bg-white shadow-card p-4 md:p-6"
      >
        {!isResults && (
          <div className="mb-4">
            <h1 className="text-lg md:text-xl font-extrabold text-text-strong">
              جستجوی پرواز
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-1">
              قیمت و برنامه پروازها را مقایسه کنید؛ بهترین انتخاب را پیدا
              کنید.
            </p>
          </div>
        )}
        <FlightForm
          key={`${params.originCode}-${params.destCode}-${params.departDate}-${params.returnDate}-${params.tripType}-${params.cabin}`}
          tripType={params.tripType}
          cabin={params.cabin}
          initial={{
            origin: params.origin
              ? { label: params.origin, code: params.originCode }
              : null,
            dest: params.destination
              ? { label: params.destination, code: params.destCode }
              : null,
            from: params.departDate || undefined,
            to: params.returnDate || undefined,
            adults: params.adults,
            kids: params.children,
          }}
        />
      </section>

      {isResults && (
        <>
          {/* ═══ نوار خلاصه + سورت ═══ */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-text-strong">
                پرواز {params.origin} به {params.destination}
              </h1>
              <p className="text-xs text-text-muted mt-1">
                {faDigits(params.departDate)} • {faDigits(params.adults)}{" "}
                بزرگسال
                {params.children > 0 &&
                  ` • ${faDigits(params.children)} کودک`}{" "}
                • {CABIN_FA[params.cabin] ?? "اکونومی"}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-1">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
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

          {/* ═══ بنر فقط نمایشی ═══ */}
          <div className="flex items-start gap-2.5 rounded-lg bg-info/10 border border-info/20 px-4 py-3 text-xs text-text-strong leading-6">
            <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <span>
              فعلاً امکان رزرو آنلاین پرواز در سفر بعدی فعال نیست؛ این صفحه
              برای <b>مقایسه قیمت و برنامه پروازها</b> است. رزرو آنلاین
              به‌زودی اضافه می‌شود.
            </span>
          </div>

          {/* ═══ نتایج ═══ */}
          {renderList("پرواز رفت", sorted.out)}
          {params.tripType === "round" && renderList("پرواز برگشت", sorted.inn)}
        </>
      )}
    </div>
  );
}