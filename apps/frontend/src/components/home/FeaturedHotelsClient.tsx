"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  Dumbbell,
  Globe2,
  MapPin,
  Sparkles,
  Star,
  Utensils,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

export interface FeaturedHotel {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  stars: number | null;
  rating: number | null;
  city: string | null;
  country: string | null;
  amenities: string[];
  url: string;
}

/* ═══ نگاشت amenity → آیکون ═══ */
const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  اینترنت: Wifi,
  وای‌فای: Wifi,
  استخر: Waves,
  pool: Waves,
  رستوران: Utensils,
  restaurant: Utensils,
  اسپا: Bath,
  spa: Bath,
  باشگاه: Dumbbell,
  gym: Dumbbell,
  بار: Wine,
  bar: Wine,
};

function getAmenityIcon(name: string) {
  const key = name.toLowerCase().trim();
  for (const [k, Icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return Sparkles;
}

/* ═══ کارت بزرگ — ✅ Radius: 10 موبایل / 12 دسکتاپ ═══ */
function BigCard({ hotel }: { hotel: FeaturedHotel }) {
  return (
    <Link
      href={hotel.url}
      className="group relative block w-full h-full overflow-hidden rounded-[10px] md:rounded-lg border border-border hover:shadow-card-hover hover:border-primary-light transition-all duration-500 ease-out"
    >
      {hotel.image ? (
        <Image
          src={hotel.image}
          alt={hotel.title}
          fill
          sizes="(max-width: 1024px) 100vw, 600px"
          quality={90}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-lightest via-white to-primary-light" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute top-4 start-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-[11px] shadow-lg">
          <Star className="w-3 h-3 fill-white" />
          <span>منتخب سفر بعدی</span>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 z-10">
        {hotel.stars && (
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
        )}
        <h3 className="text-white text-xl md:text-2xl mb-2 drop-shadow-lg line-clamp-2">
          {hotel.title}
        </h3>
        {(hotel.country || hotel.city) && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {hotel.country && (
              <div className="flex items-center gap-1.5 text-white/90 text-sm">
                <Globe2 className="w-4 h-4" />
                <span>{hotel.country}</span>
              </div>
            )}
            {hotel.country && hotel.city && (
              <span className="text-white/40">•</span>
            )}
            {hotel.city && (
              <div className="flex items-center gap-1.5 text-white/85 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{hotel.city}</span>
              </div>
            )}
          </div>
        )}
        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity, i) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold"
                >
                  <Icon className="w-3 h-3" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <span className="group-hover:text-primary-light transition-colors">
            مشاهده و رزرو
          </span>
          <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
            <ArrowLeft className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ═══ کارت کوچک — ✅ Radius: 10 موبایل / 12 دسکتاپ ═══ */
function SmallCard({ hotel }: { hotel: FeaturedHotel }) {
  return (
    <Link
      href={hotel.url}
      className="group relative block w-full h-full overflow-hidden rounded-[10px] md:rounded-lg border border-border hover:shadow-card-hover hover:border-primary-light transition-all duration-500 ease-out"
    >
      {hotel.image ? (
        <Image
          src={hotel.image}
          alt={hotel.title}
          fill
          sizes="(max-width: 1024px) 62vw, 300px"
          quality={85}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-lightest via-white to-primary-light" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute top-3 start-3 z-10">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-[10px] shadow">
          <Star className="w-2.5 h-2.5 fill-white" />
          <span>منتخب</span>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-4 z-10">
        {hotel.stars && (
          <div className="flex items-center gap-0.5 mb-1">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
        )}
        <h3 className="text-white text-sm md:text-[15px] drop-shadow line-clamp-1 mb-1.5">
          {hotel.title}
        </h3>
        <div className="flex items-center gap-2 text-white/80 text-xs flex-wrap">
          {hotel.country && (
            <span className="flex items-center gap-1">
              <Globe2 className="w-3 h-3" />
              <span className="truncate">{hotel.country}</span>
            </span>
          )}
          {hotel.country && hotel.city && (
            <span className="text-white/40">•</span>
          )}
          {hotel.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{hotel.city}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ═══ Bento اصلی ═══ */
export default function FeaturedHotelsClient({
  hotels,
}: {
  hotels: FeaturedHotel[];
}) {
  if (hotels.length === 0) return null;
  const [first, ...rest] = hotels;
  const smallOnes = rest.slice(0, 4);

  return (
    <section className="ns-container py-8 md:py-12">
      <SectionHeader
        title="هتل‌های منتخب"
        subtitle="انتخاب ویژه تیم سفر بعدی برای اقامتی بی‌نظیر"
        href="/hotels"
        linkLabel="مشاهده همه هتل‌ها"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:h-[380px]">
        {/* کارت بزرگ — موبایل کمی کوتاه‌تر */}
        <div className="h-[320px] md:h-full md:col-span-2">
          <BigCard hotel={first} />
        </div>

        {/* ستون کوچک‌ها — موبایل: کاروسل لبه‌به‌لبه / دسکتاپ: ستونی */}
        <div className="md:h-full md:grid md:grid-cols-1 md:auto-rows-fr md:gap-5">
          <div className="ns-bleed-x flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:contents md:overflow-visible md:pb-0">
            {smallOnes.length > 0 ? (
              smallOnes.map((h) => (
                <div
                  key={h.id}
                  className="w-[62%] sm:w-[45%] md:w-auto h-[200px] md:h-auto shrink-0 snap-start"
                >
                  <SmallCard hotel={h} />
                </div>
              ))
            ) : (
              <Link
                href="/hotels"
                className="relative flex flex-col items-center justify-center text-center rounded-[10px] md:rounded-lg border-2 border-dashed border-border bg-bg-sec/30 p-6 hover:border-primary hover:bg-primary-lightest/30 transition w-[62%] md:w-auto h-[200px] md:h-full shrink-0 snap-start"
              >
                <Star className="w-10 h-10 text-primary fill-primary mb-2" />
                <div className="font-bold text-text-strong mb-1">
                  هتل‌های بیشتری در راه است
                </div>
                <div className="text-xs text-text-muted">
                  به‌زودی هتل‌های برگزیده جدید اضافه می‌شود
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}