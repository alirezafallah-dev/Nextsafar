"use client";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  BadgeCheck,
  MapPin,
  BedDouble,
  Users,
  Check,
  CalendarDays,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import HotelsMap, { type HotelMapPoint } from "./HotelsMap";
import {
  faDigits,
  AMENITY_FA,
  type OnlineHotelDetails,
} from "@/lib/api/hotels";

const amenityFa = (a: string) => {
  const key = a
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return AMENITY_FA[key] ?? a;
};

interface OnlineHotelPageClientProps {
  hotel: OnlineHotelDetails | null;
  fallbackName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}

export default function OnlineHotelPageClient({
  hotel,
  fallbackName,
  city,
  checkIn,
  checkOut,
  adults,
}: OnlineHotelPageClientProps) {
  if (!hotel) {
    return (
      <div className="ns-container py-16">
        <div className="max-w-md mx-auto rounded-lg border-2 border-dashed border-border bg-bg-sec/30 p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-3" />
          <h1 className="font-extrabold text-text-strong mb-2">
            اطلاعات هتل در دسترس نیست
          </h1>
          <p className="text-xs text-text-muted mb-5 leading-6">
            امکان دریافت جزئیات این هتل وجود ندارد. لطفاً به نتایج جستجو
            برگردید و هتل دیگری انتخاب کنید.
          </p>
          <Link
            href={`/hotels/search?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`}
            className="ns-btn ns-btn-primary !py-2.5 !text-xs"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به نتایج
          </Link>
        </div>
      </div>
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(checkOut.replace(/\//g, "-")).getTime() -
              new Date(checkIn.replace(/\//g, "-")).getTime()) /
              86400000,
          ) || 1,
        )
      : 1;

  const mapPoints: HotelMapPoint[] = hotel.gps
    ? [
        {
          key: "self",
          lat: hotel.gps.latitude,
          lng: hotel.gps.longitude,
          title: hotel.name,
          price: hotel.per_night_toman || null,
          isSite: false,
          href: null,
        },
      ]
    : [];

  const gallery = hotel.images.slice(0, 5);

  return (
    <div className="ns-container py-6 md:py-8 space-y-5">
      <Link
        href={`/hotels/search?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted hover:text-primary transition"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        بازگشت به هتل‌های {city}
      </Link>

      {gallery.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-lg overflow-hidden h-64 md:h-80">
          <div className="col-span-2 row-span-2 relative bg-bg-sec">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[0]}
              alt={hotel.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {gallery.slice(1).map((g, i) => (
            <div key={i} className="relative bg-bg-sec hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-extrabold text-text-strong">
            {hotel.name || fallbackName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {hotel.stars > 0 && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </span>
            )}
            {hotel.rating > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-bold">
                <BadgeCheck className="w-4 h-4" />
                {faDigits(hotel.rating.toFixed(1))}
                <span className="text-text-muted font-normal">
                  ({faDigits(hotel.reviews_count)} نظر)
                </span>
              </span>
            )}
            {hotel.address && (
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="w-3.5 h-3.5" />
                {hotel.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          {hotel.amenities.length > 0 && (
            <section className="ns-card p-4 md:p-5">
              <h2 className="flex items-center gap-2 font-extrabold text-sm mb-3">
                <Wifi className="w-4 h-4 text-primary" />
                امکانات هتل
              </h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 14).map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1.5 rounded-md bg-bg-sec text-[11px] font-bold text-text-muted"
                  >
                    {amenityFa(a)}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="ns-card p-4 md:p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-sm mb-3">
              <BedDouble className="w-4 h-4 text-primary" />
              اتاق‌های موجود
            </h2>
            {hotel.rooms.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">
                برای این تاریخ اتاقی گزارش نشد؛ تاریخ دیگری امتحان کنید.
              </p>
            ) : (
              <div className="space-y-3">
                {hotel.rooms.map((r, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="w-full md:w-28 h-24 rounded-lg overflow-hidden bg-bg-sec shrink-0">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-subtle/40">
                          <BedDouble className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-text-strong">{r.name}</div>
                      {r.description && (
                        <div className="text-[11px] text-text-muted mt-1 line-clamp-2">
                          {r.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.breakfast_included && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">
                            <Check className="w-3 h-3" /> صبحانه رایگان
                          </span>
                        )}
                        {r.free_cancellation && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-info/10 text-info text-[10px] font-bold">
                            <Check className="w-3 h-3" /> لغو رایگان
                          </span>
                        )}
                        {r.beds && (
                          <span className="px-2 py-0.5 rounded-md bg-bg-sec text-[10px] font-bold text-text-muted">
                            {r.beds}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="md:text-end shrink-0 flex md:flex-col items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-extrabold text-primary-dark">
                          {faDigits(r.per_night_toman.toLocaleString("en-US"))}{" "}
                          <span className="text-[10px] text-text-muted">تومان / شب</span>
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          مجموع: {faDigits((r.per_night_toman * nights).toLocaleString("en-US"))}
                        </div>
                      </div>
                      <span className="px-3 py-2 rounded-lg bg-bg-sec text-[10px] font-bold text-text-muted">
                        رزرو به‌زودی
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {hotel.reviews.length > 0 && (
            <section className="ns-card p-4 md:p-5">
              <h2 className="flex items-center gap-2 font-extrabold text-sm mb-3">
                <BadgeCheck className="w-4 h-4 text-primary" />
                نظرات مهمانان
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotel.reviews.map((rv, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-text-strong">
                        {rv.author}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">
                        {faDigits(rv.rating.toFixed(1))}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-2 leading-5 line-clamp-3">
                      {rv.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {mapPoints.length > 0 && (
            <section className="ns-card overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2 font-extrabold text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                موقعیت روی نقشه
              </div>
              <HotelsMap points={mapPoints} height={240} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-4 ns-card p-4 md:p-5 space-y-3">
          <div className="text-[11px] font-bold text-text-muted">قیمت هر شب از</div>
          <div className="text-2xl font-extrabold text-primary-dark">
            {hotel.per_night_toman > 0
              ? `${faDigits(hotel.per_night_toman.toLocaleString("en-US"))} تومان`
              : "استعلام قیمت"}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <CalendarDays className="w-3.5 h-3.5" />
            {faDigits(checkIn)} تا {faDigits(checkOut)} • {faDigits(nights)} شب
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <Users className="w-3.5 h-3.5" />
            {faDigits(adults)} بزرگسال
          </div>
          {hotel.check_in_time && (
            <div className="text-[11px] text-text-muted">
              ورود از {hotel.check_in_time} • خروج تا {hotel.check_out_time ?? "—"}
            </div>
          )}
          <div className="rounded-lg bg-info/10 border border-info/20 px-3 py-2 text-[10px] text-text-strong leading-5">
            این هتل در سایت سفر بعدی پست اختصاصی ندارد؛ اطلاعات و قیمت‌ها
            به‌صورت لحظه‌ای از تامین‌کننده دریافت می‌شود.
          </div>
          <Link
            href={`/hotels/search?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`}
            className="ns-btn ns-btn-primary justify-center w-full !py-3 !text-xs"
          >
            مشاهده هتل‌های مشابه
          </Link>
        </aside>
      </div>
    </div>
  );
}