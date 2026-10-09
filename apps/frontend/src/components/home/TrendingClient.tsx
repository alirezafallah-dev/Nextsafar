"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Backpack,
  BedDouble,
  MapPin,
  Plane,
  Star,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export interface HotelItem {
  slug: string;
  title: string;
  image: string | null;
  stars: number | null;
  city: string;
  price: number | null;
  rating: number | null;
}

export interface TourCatItem {
  slug: string;
  name: string;
  count: number;
  image: string | null;
  duration?: number | null;
}

function PriceTag({ price }: { price: number | null }) {
  if (!price)
    return (
      <span className="text-xs font-semibold text-primary">
        استعلام آنی از Partocrs
      </span>
    );
  return (
    <span className="text-sm text-primary-dark">
      از {formatNumber(price)}{" "}
      <span className="text-[10px] font-medium text-text-muted">تومان</span>
    </span>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} ستاره`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "text-tour fill-tour" : "text-border"}`}
        />
      ))}
    </span>
  );
}

/* ✅ Radius توکن کارت: 10 موبایل / 12 دسکتاپ + عرض کاروسل موبایل */
function HotelCard({ item }: { item: HotelItem }) {
  return (
    <Link
      href={`/hotels/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-[10px] md:rounded-lg border border-border bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-card-hover hover:border-primary-light w-[78%] sm:w-[46%] md:w-auto shrink-0 snap-start"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-sec">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw"
            quality={85}
            loading="lazy"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-lightest via-white to-primary-light flex items-center justify-center">
            <BedDouble className="w-14 h-14 text-primary/40" />
          </div>
        )}
        {/* ✅ بج: توکن 8px */}
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-bold">
          <BedDouble className="w-3 h-3" /> هتل
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-sm md:text-[15px] text-text-strong line-clamp-1 group-hover:text-primary-dark transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {item.stars ? <Stars count={item.stars} /> : null}
          {item.city && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              {item.city}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2 border-t border-divider flex items-center justify-between">
          <PriceTag price={item.price} />
          <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
            <ArrowLeft className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TourCatCard({ item }: { item: TourCatItem }) {
  return (
    <Link
      href={`/tours?cat=${item.slug}`}
      className="group rounded-[10px] md:rounded-lg overflow-hidden border border-border hover:border-tour hover:shadow-card-hover transition-all duration-500 ease-out hover:-translate-y-1.5 bg-white flex flex-col w-[78%] sm:w-[46%] md:w-auto shrink-0 snap-start"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-tour/20 to-primary-lightest/30 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw"
            quality={85}
            loading="lazy"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Plane className="w-14 h-14 text-tour/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {item.duration && (
          <span className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur text-[11px] text-tour-hover shadow">
            {formatNumber(item.duration)} شب
          </span>
        )}
        <div className="absolute bottom-2.5 inset-x-2.5">
          <div className="text-white text-base md:text-lg drop-shadow line-clamp-1">
            {item.name}
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between gap-2 flex-1">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Backpack className="w-3.5 h-3.5 text-tour" />
            <span>
              <span className="font-bold text-text-strong">
                {formatNumber(item.count)}
              </span>{" "}
              هتل فعال
            </span>
          </div>
          <span className="text-[10px] text-text-subtle">
            مشاهده پکیج‌ها و قیمت‌ها
          </span>
        </div>
        <span className="w-9 h-9 rounded-full bg-tour/10 text-tour group-hover:bg-tour group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300">
          <ArrowLeft className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

export default function TrendingClient({
  hotels,
  tourCats,
}: {
  hotels: HotelItem[];
  tourCats: TourCatItem[];
}) {
  const [tab, setTab] = useState<"hotel" | "tour">(
    hotels.length ? "hotel" : "tour",
  );

  /* ✅ کانتینر مشترک: موبایل کاروسل لبه‌به‌لبه / دسکتاپ گرید */
  const containerCls =
    "ns-bleed-x flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0";

  return (
    <div>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="ns-section-title !mb-1">داغ‌ترین‌های هفته</h2>
          <p className="text-xs md:text-sm text-text-muted">
            پیشنهادهایی که همین حالا بیشترین رزرو را دارند
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bg-sec border border-border rounded-lg p-1">
          <button
            onClick={() => setTab("hotel")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
              tab === "hotel"
                ? "bg-primary text-white shadow-md"
                : "text-text-muted hover:text-primary-dark"
            }`}
          >
            هتل‌ها
          </button>
          <button
            onClick={() => setTab("tour")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
              tab === "tour"
                ? "bg-tour text-white shadow-md"
                : "text-text-muted hover:text-tour-hover"
            }`}
          >
            تورها
          </button>
        </div>
      </div>

      {tab === "hotel" &&
        (hotels.length === 0 ? (
          <div className="rounded-[10px] md:rounded-lg border border-border bg-white p-10 text-center text-sm text-text-muted">
            هنوز هتلی ثبت نشده است
          </div>
        ) : (
          <div className={containerCls}>
            {hotels.map((h) => (
              <HotelCard key={h.slug} item={h} />
            ))}
          </div>
        ))}

      {tab === "tour" &&
        (tourCats.length === 0 ? (
          <div className="rounded-[10px] md:rounded-lg border border-border bg-white p-10 text-center text-sm text-text-muted">
            هنوز دسته‌بندی توری ثبت نشده است
          </div>
        ) : (
          <div className={containerCls}>
            {tourCats.map((c) => (
              <TourCatCard key={c.slug} item={c} />
            ))}
          </div>
        ))}
    </div>
  );
}