"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Bus,
  CalendarDays,
  MapPin,
  Plane,
  Sparkles,
  Stamp,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { WorldCountry, WorldNextTour } from "./WorldMapSection";
import type { PanelTab } from "./WorldMapExplorer";

/* ═══════════════════════════════════════════════════════════
   اینترفیس‌ها
═══════════════════════════════════════════════════════════ */
interface PostItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  image: string | null;
  url: string;
}

interface TourPackage {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  departure_en: string | null;
  departure_fa: string | null;
  return_en: string | null;
  nights: number | null;
  transport: string | null;
  airline: string | null;
  currency: string | null;
  url: string;
}

interface CountryPosts {
  country_id: number;
  hotels: PostItem[];
  tours: TourPackage[];
  destinations: PostItem[];
  guides: PostItem[];
  visa: PostItem | null;
}

/* ═══════════════════════════════════════════════════════════
   کامپوننت اصلی پنل
═══════════════════════════════════════════════════════════ */
export default function WorldMapPanel({
  country,
  rank,
  tab,
}: {
  country: WorldCountry;
  rank: number;
  tab: PanelTab;
}) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [posts, setPosts] = useState<CountryPosts | null>(null);
  const [loading, setLoading] = useState(false);

  /* ─── دریافت داده‌های کشور از endpoint ─── */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const url =
      (process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json") +
      `/nextsafar/v1/country-posts?id=${country.id}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setPosts(d))
      .catch(() => {
        if (alive) setPosts(null);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [country.id]);

  /* ─── ریست شهر انتخابی هنگام عوض شدن کشور یا تب ─── */
  useEffect(() => {
    setSelectedCity(null);
  }, [country.id, tab]);

  const activeCity = selectedCity
    ? country.cities.find((c) => c.slug === selectedCity)
    : null;

  const nextTour: WorldNextTour | null =
    (activeCity?.next_tour ?? null) ||
    (country.cities.map((c) => c.next_tour).find(Boolean) ?? null);

  const postList =
    tab === "hotel"
      ? posts?.hotels
      : tab === "destination"
        ? posts?.destinations
        : tab === "guide"
          ? posts?.guides
          : null;

  const tourPackages = tab === "tour" ? posts?.tours : null;

  /* ═══ مسیر آرشیو بر اساس تب ═══ */
  const archiveHref =
    tab === "hotel"
      ? `/hotels?country=${country.slug}`
      : tab === "tour"
        ? `/tours?country=${country.slug}`
        : tab === "destination"
          ? `/destinations?country=${country.slug}`
          : `/travel-guides?country=${country.slug}`;

  const archiveLabel =
    tab === "hotel"
      ? "هتل‌ها"
      : tab === "tour"
        ? "تورها"
        : tab === "destination"
          ? "مقاصد"
          : "راهنماها";

  return (
    <aside className="rounded-lg border border-border bg-white overflow-hidden flex flex-col max-h-[600px]">
      {/* ═══ هدر بنر ═══ */}
      {country.banner && (
        <div className="relative h-32 shrink-0">
          <Image
            src={country.banner}
            alt={country.name}
            fill
            sizes="380px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-3 start-4 flex items-center gap-2">
            {country.flag && (
              <Image
                src={country.flag}
                alt=""
                width={26}
                height={18}
                className="rounded-sm object-cover shadow"
              />
            )}
            <span className=" text-lg text-white drop-shadow">
              {country.name}
            </span>
          </div>
          <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur border border-white/20 text-white text-[11px] font-bold">
            رتبه {formatNumber(rank)}
          </span>
        </div>
      )}

      {/* ═══ محتوای پنل ═══ */}
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        {/* ═══ حالت: شهر انتخاب شده (زیرنمای جزئیات) ═══ */}
        {activeCity && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSelectedCity(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              بازگشت به لیست شهرها
            </button>

            <div className="rounded-lg bg-primary-lightest/40 border border-primary-light p-3">
              <div className="flex items-center gap-2 mb-2">
                {activeCity.image && (
                  <Image
                    src={activeCity.image}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="font-bold text-sm text-text-strong">
                    {activeCity.name}
                  </div>
                  <div className="text-[11px] text-text-muted">
                    {formatNumber(
                      Object.values(activeCity.counts).reduce(
                        (a, b) => a + b,
                        0,
                      ),
                    )}{" "}
                    محتوا
                  </div>
                </div>
              </div>
            </div>

            {/* نزدیک‌ترین تور */}
            {nextTour && (
              <div className="rounded-lg bg-tour/10 border border-tour/30 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-tour-hover mb-1.5">
                  <Plane className="w-3.5 h-3.5" /> نزدیک‌ترین تور
                </div>
                <div className="text-sm font-bold text-text-strong mb-1">
                  {nextTour.title}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-muted">
                  {nextTour.departure_fa && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />{" "}
                      {nextTour.departure_fa}
                    </span>
                  )}
                  {nextTour.nights ? (
                    <span>{formatNumber(nextTour.nights)} شب</span>
                  ) : null}
                  {nextTour.transport && (
                    <span className="flex items-center gap-1">
                      <Bus className="w-3 h-3" /> {nextTour.transport}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA شهر */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/hotels?city=${activeCity.slug}`}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-bold transition"
              >
                <BedDouble className="w-3.5 h-3.5" /> هتل‌ها
              </Link>
              <Link
                href={`/tours?city=${activeCity.slug}`}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-tour hover:bg-tour-hover text-white text-[11px] font-bold transition"
              >
                <Plane className="w-3.5 h-3.5" /> تورها
              </Link>
            </div>
          </div>
        )}

        {/* ═══ حالت: تب "همه" = لیست شهرها ═══ */}
        {tab === "all" && !activeCity && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-bold text-text-muted mb-1">
              {country.cities.length} شهر فعال
            </div>
            {country.cities.map((city) => {
              const total = Object.values(city.counts).reduce(
                (a, b) => a + b,
                0,
              );
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city.slug)}
                  className="flex items-center gap-2.5 p-2 rounded-md bg-bg-sec/40 border border-border hover:border-primary-light hover:bg-primary-lightest/30 transition cursor-pointer text-start"
                >
                  {city.image ? (
                    <Image
                      src={city.image}
                      alt=""
                      width={44}
                      height={44}
                      className="rounded-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-bg-sec flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-text-subtle" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-strong truncate">
                      {city.name}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {formatNumber(total)} محتوا
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-text-subtle shrink-0" />
                </button>
              );
            })}

            {/* ویزا */}
            {posts?.visa && (
              <Link
                href={posts.visa.url}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary-lightest/40 border border-primary-light/50 text-[12px] font-bold text-primary-dark hover:bg-primary-lightest transition"
              >
                <Stamp className="w-4 h-4" /> {posts.visa.title}
              </Link>
            )}
          </div>
        )}

        {/* ═══ تب تور: کارت‌های پکیج تور ═══ */}
        {tab === "tour" && !activeCity && (
          <div className="flex flex-col gap-2">
            {loading && (
              <div className="text-center text-xs text-text-muted py-4">
                در حال بارگذاری...
              </div>
            )}

            {/* خطای endpoint */}
            {!loading && posts === null && (
              <div className="text-center py-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs text-red-600 font-semibold mb-1">
                  ⚠️ endpoint وصل نیست
                </div>
                <div className="text-[10px] text-red-500">
                  فایل <code>country-posts-endpoint.php</code> را در پلاگین
                  بررسی کن
                </div>
              </div>
            )}

            {/* لیست خالی */}
            {!loading &&
              posts !== null &&
              (!tourPackages || tourPackages.length === 0) && (
                <div className="text-center text-xs text-text-muted py-6 bg-bg-sec/30 rounded-lg">
                  تور فعالی یافت نشد
                </div>
              )}

            {/* کارت‌های پکیج تور */}
            {!loading &&
              tourPackages?.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={pkg.url}
                  className="group rounded-md overflow-hidden border border-border hover:border-tour hover:shadow-md transition-all bg-white"
                >
                  {/* بنر بالای کارت */}
                  <div className="relative h-24 bg-gradient-to-br from-tour/20 to-primary-lightest/30 overflow-hidden">
                    {pkg.image ? (
                      <Image
                        src={pkg.image}
                        alt={pkg.title}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plane className="w-10 h-10 text-tour/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* بج تعداد شب */}
                    {pkg.nights && (
                      <span className="absolute top-2 start-2 px-2 py-1 rounded-md bg-white/95 backdrop-blur text-[10px]  text-tour-hover shadow">
                        {formatNumber(pkg.nights)} شب
                      </span>
                    )}

                    {/* عنوان روی تصویر */}
                    <div className="absolute bottom-2 inset-x-2">
                      <div className="text-white font-bold text-sm drop-shadow line-clamp-1">
                        {pkg.title}
                      </div>
                    </div>
                  </div>

                  {/* جزئیات پایین */}
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      {pkg.departure_fa && (
                        <div className="flex items-center gap-1 text-[11px] text-text-muted">
                          <CalendarDays className="w-3 h-3 text-tour" />
                          <span>اعزام {pkg.departure_fa}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        {pkg.transport && (
                          <span className="flex items-center gap-1">
                            <Bus className="w-3 h-3" /> {pkg.transport}
                          </span>
                        )}
                        {pkg.airline && (
                          <span className="flex items-center gap-1 truncate">
                            <Plane className="w-3 h-3" /> {pkg.airline}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-tour/10 text-tour group-hover:bg-tour group-hover:text-white flex items-center justify-center shrink-0 transition">
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}

            {/* مشاهده همه */}
            {!loading && tourPackages && tourPackages.length > 0 && (
              <Link
                href={archiveHref}
                className="flex items-center justify-center gap-1 mt-1 px-3 py-2 rounded-md bg-tour hover:bg-tour-hover text-white text-[11px] font-bold transition"
              >
                مشاهده همه تورها
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* ═══ حالت: تب‌های پست (هتل/مقصد/راهنما) ═══ */}
        {tab !== "all" && tab !== "tour" && !activeCity && (
          <div className="flex flex-col gap-2">
            {loading && (
              <div className="text-center text-xs text-text-muted py-4">
                در حال بارگذاری...
              </div>
            )}

            {/* خطای endpoint */}
            {!loading && posts === null && (
              <div className="text-center py-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs text-red-600 font-semibold mb-1">
                  ⚠️ endpoint وصل نیست
                </div>
                <div className="text-[10px] text-red-500">
                  فایل <code>country-posts-endpoint.php</code> را در پلاگین
                  بررسی کن
                </div>
              </div>
            )}

            {/* لیست خالی */}
            {!loading &&
              posts !== null &&
              (!postList || postList.length === 0) && (
                <div className="text-center text-xs text-text-muted py-6 bg-bg-sec/30 rounded-lg">
                  موردی یافت نشد
                </div>
              )}

            {/* لیست پست‌ها */}
            {!loading &&
              postList?.map((p) => (
                <Link
                  key={p.id}
                  href={p.url}
                  className="group flex items-center gap-2.5 p-2 rounded-md bg-bg-sec/40 border border-border hover:border-primary-light hover:bg-primary-lightest/30 transition"
                >
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={48}
                      height={48}
                      className="rounded-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-bg-sec flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-text-subtle" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-text-strong line-clamp-2 group-hover:text-primary-dark transition">
                      {p.title}
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-text-subtle shrink-0 group-hover:text-primary transition" />
                </Link>
              ))}

            {/* دکمه مشاهده همه */}
            {!loading && postList && postList.length > 0 && (
              <Link
                href={archiveHref}
                className="flex items-center justify-center gap-1 mt-1 px-3 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-[11px] font-bold transition"
              >
                مشاهده همه {archiveLabel}
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
