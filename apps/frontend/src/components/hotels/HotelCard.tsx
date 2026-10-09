"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  BadgeCheck,
  Globe,
  Heart,
  BedDouble,
  ExternalLink,
} from "lucide-react";
import {
  AMENITY_FA,
  faDigits,
  optimizedImage,
  type UnifiedHotel,
  type HotelQueryInfo,
} from "@/lib/api/hotels";
import { useFavorites } from "@/lib/favorites";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} ستاره`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < n ? "text-warning fill-warning" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export default function HotelCard({
  item,
  nights,
  query,
  onHover,
}: {
  item: UnifiedHotel;
  nights: number;
  query?: HotelQueryInfo;
  onHover?: (key: string | null) => void;
}) {
  const { has, toggle } = useFavorites();

  const isSite = item.source === "site";
  const key = isSite
    ? `site-${item.site!.id}`
    : `online-${item.online!.property_id}`;
  const isFav = has(key);

  /* ═══ متغیرهای نمایش ═══ */
  const title = isSite ? item.site!.title : item.online!.name;
  const titleEn = isSite ? item.site!.title_en : undefined;
  const image = (isSite ? item.site!.image : item.online!.image) ?? null;
  const imgSrc = optimizedImage(image, 480);
  const stars = isSite ? item.site!.stars : (item.online!.stars ?? 0);
  const rating = isSite
    ? item.site!.rating || item.online?.rating || 0
    : item.online!.rating;
  const reviews = item.online?.reviews ?? 0;
  const address = isSite
    ? item.site!.address || item.online?.address || ""
    : item.online!.address;
  const amenities = (
    isSite ? item.site!.amenities : (item.online!.amenities ?? [])
  ).slice(0, 4);
  const price = item.price?.per_night_toman ?? 0;

  /* ═══ لینک‌ها ═══ */
  const internalUrl =
    !isSite && item.online?.token && query
      ? `/hotels/online/${encodeURIComponent(item.online.property_id)}?token=${encodeURIComponent(item.online.token)}&name=${encodeURIComponent(item.online.name)}&city=${encodeURIComponent(query.city)}&checkIn=${encodeURIComponent(query.checkIn)}&checkOut=${encodeURIComponent(query.checkOut)}&adults=${query.adults}`
      : null;
  const href = isSite ? item.site!.url : (internalUrl ?? item.online!.link);
  const isExternal = !isSite && !internalUrl;

  /* ═══ JSX بلوک قیمت - فشرده ═══ */
  const priceBlockCompact = price > 0 ? (
    <div>
      <div className="text-sm font-extrabold text-primary-dark leading-5">
        {faDigits(price.toLocaleString("en-US"))}{" "}
        <span className="text-[10px] font-bold text-text-muted">تومان</span>
      </div>
      {nights > 0 && (
        <div className="text-[10px] text-text-muted mt-0.5">
          {faDigits(nights)} شب:{" "}
          <span className="font-bold text-text-strong">
            {faDigits((price * nights).toLocaleString("en-US"))}
          </span>
        </div>
      )}
    </div>
  ) : (
    <div className="text-[10px] font-bold text-text-muted">
      {isSite ? "قیمت در صفحه" : "استعلام"}
    </div>
  );

  /* ═══ JSX بلوک قیمت - کامل ═══ */
  const priceBlockFull = price > 0 ? (
    <div className="text-end">
      <div className="text-[11px] font-bold text-text-muted mb-0.5">
        قیمت هر شب
      </div>
      <div className="text-xl md:text-2xl font-extrabold text-primary-dark leading-7">
        {faDigits(price.toLocaleString("en-US"))}{" "}
        <span className="text-xs font-bold text-text-muted">تومان</span>
      </div>
      {nights > 0 && (
        <div className="text-[11px] text-text-muted mt-1">
          مجموع {faDigits(nights)} شب:{" "}
          <span className="font-bold text-text-strong">
            {faDigits((price * nights).toLocaleString("en-US"))}
          </span>
        </div>
      )}
    </div>
  ) : (
    <div className="text-xs font-bold text-text-muted text-end">
      {isSite ? "قیمت در صفحه هتل" : "استعلام قیمت"}
    </div>
  );

  /* ═══ JSX دکمه CTA ═══ */
  const ctaButton = isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener"
      className="ns-btn ns-btn-primary justify-center !py-2.5 !px-3 !text-xs"
    >
      <Globe className="w-3.5 h-3.5" />
      مشاهده هتل
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  ) : (
    <Link
      href={href}
      className="ns-btn ns-btn-primary justify-center !py-2.5 !px-3 !text-xs"
    >
      مشاهده هتل
    </Link>
  );

  /* ═══ JSX دکمه CTA - تمام عرض ═══ */
  const ctaButtonFull = isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener"
      className="ns-btn ns-btn-primary justify-center !py-2.5 !px-3 !text-xs w-full"
    >
      <Globe className="w-3.5 h-3.5" />
      مشاهده هتل
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  ) : (
    <Link
      href={href}
      className="ns-btn ns-btn-primary justify-center !py-2.5 !px-3 !text-xs w-full"
    >
      مشاهده هتل
    </Link>
  );

  return (
    <article
      onMouseEnter={() => onHover?.(key)}
      onMouseLeave={() => onHover?.(null)}
      className="ns-card overflow-hidden flex flex-col md:flex-row md:h-52 group relative"
    >
      {/* ═══ تصویر (مربع با padding) ═══ */}
      <div className="relative p-2.5 shrink-0">
        <div className="relative w-full h-44 md:w-44 md:h-44 rounded-xl overflow-hidden bg-bg-sec">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-text-subtle/50">
              <BedDouble className="w-8 h-8" />
              <span className="text-[10px] font-bold">بدون تصویر</span>
            </div>
          )}

          {/* بج‌ها */}
          <div className="absolute top-2 start-2 flex flex-col gap-1 items-start">
            {isSite && (
              <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-primary/95 text-white backdrop-blur">
                سفر بعدی
              </span>
            )}
            {item.badges.includes("featured") && (
              <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-warning/95 text-white backdrop-blur">
                ویژه
              </span>
            )}
          </div>

          {/* ❤️ قلب علاقه‌مندی */}
          <button
            type="button"
            aria-label={isFav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(key, {
                source: item.source,
                title,
                image: imgSrc,
                url: href,
              });
            }}
            className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isFav ? "fill-danger text-danger" : "text-text-muted"}`}
            />
          </button>

          {/* درصد تطبیق */}
          {isSite && item.match_confidence !== null && (
            <span className="absolute bottom-2 start-2 px-2 py-1 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur">
              تطبیق {faDigits(Math.round(item.match_confidence * 100))}٪
            </span>
          )}
        </div>
      </div>

      {/* ═══ اطلاعات (وسط) ═══ */}
      <div className="flex-1 min-w-0 px-2 md:px-3 py-2 md:py-3 flex flex-col gap-1.5 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm md:text-base text-text-strong truncate">
              {title}
            </h3>
            {titleEn && (
              <div
                className="text-[10px] text-text-subtle truncate mt-0.5"
                dir="ltr"
              >
                {titleEn}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {stars > 0 && <Stars n={stars} />}
            {rating > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                {faDigits(rating.toFixed(1))}
                {reviews > 0 && (
                  <span className="text-text-muted font-normal hidden md:inline">
                    ({faDigits(reviews)} نظر)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {address && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {amenities.map((a) => (
              <span
                key={a}
                className="px-2 py-1 rounded-md bg-bg-sec text-[10px] font-bold text-text-muted"
              >
                {AMENITY_FA[a] ?? a}
              </span>
            ))}
          </div>
        )}

        {/* ═══ موبایل: قیمت + دکمه ═══ */}
        <div className="md:hidden mt-auto pt-2 flex items-center justify-between gap-3 border-t border-divider">
          {priceBlockCompact}
          {ctaButton}
        </div>
      </div>

      {/* ═══ ستون قیمت + دکمه (دسکتاپ — سمت چپ) ═══ */}
      <div className="hidden md:flex flex-col justify-between items-stretch w-44 shrink-0 p-3 gap-2 border-s border-divider/60">
        {priceBlockFull}
        {ctaButtonFull}
      </div>
    </article>
  );
}