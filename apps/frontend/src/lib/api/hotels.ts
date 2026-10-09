import { buildApiUrl } from "./config";

/* ═══════════════════════════════════════════════════════
   تایپ‌های هتل
   ═══════════════════════════════════════════════════════ */

export interface SiteHotel {
  id: number;
  slug: string;
  title: string;
  title_en?: string;
  stars: number;
  rating: number;
  address: string;
  image: string | null;
  amenities: string[];
  featured: boolean;
  url: string;
  lat: number | null;
  lng: number | null;
}

export interface OnlineHotel {
  property_id: string;
  name: string;
  image: string | null;
  rating: number;
  reviews: number;
  address: string;
  lat: number | null;
  lng: number | null;
  stars: number;
  amenities: string[];
  link: string;
  token?: string;
}

export interface HotelPrice {
  per_night_toman: number;
  usd: number;
}

export interface UnifiedHotel {
  source: "site" | "online";
  match_confidence: number | null;
  site: SiteHotel | null;
  online: OnlineHotel | null;
  price: HotelPrice | null;
  badges: string[];
}

export interface HotelsSearchResult {
  ok: boolean;
  items: UnifiedHotel[];
  from_cache: boolean;
  provider: string;
  meta: {
    nights: number;
    site_count: number;
    online_count: number;
    matched?: number;
    stale: boolean;
  };
}

/* ═══════════════════════════════════════════════════════
   Helper ها
   ═══════════════════════════════════════════════════════ */
/**
 * 🖼️ بهینه‌سازی URL تصویر
 * تصاویر googleusercontent با سایز اصلی (s10000) چند مگابایت هستند!
 * این تابع سایز درخواستی را جایگزین می‌کند.
 */
export function optimizedImage(url: string | null | undefined, width = 480): string | null {
  if (!url) return null;
  if (url.includes("googleusercontent.com")) {
    const base = url.split("=")[0];
    const h = Math.round(width * 0.75);
    return `${base}=w${width}-h${h}-c-no`;
  }
  return url;
}

   /* ═══ جزئیات هتل آنلاین ═══ */
export interface OnlineHotelRoom {
  name: string;
  description: string;
  image: string | null;
  beds: string;
  max_occupancy: number | null;
  price_usd: number;
  per_night_toman: number;
  free_cancellation: boolean;
  breakfast_included: boolean;
}

export interface OnlineHotelDetails {
  name: string;
  type: string;
  address: string;
  rating: number;
  reviews_count: number;
  stars: number;
  images: string[];
  rooms: OnlineHotelRoom[];
  reviews: { author: string; rating: number; date: string; snippet: string }[];
  amenities: string[];
  gps: { latitude: number; longitude: number } | null;
  check_in_time: string | null;
  check_out_time: string | null;
  nearby_places: { name?: string; distance?: string }[];
  price_usd: number;
  per_night_toman: number;
}

export interface HotelQueryInfo {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}

/** URL داخلی صفحه هتل آنلاین */
export function onlineHotelUrl(i: UnifiedHotel, q: HotelQueryInfo): string | null {
  if (i.source !== "online" || !i.online?.token) return null;
  const p = new URLSearchParams();
  p.set("token", i.online.token);
  p.set("name", i.online.name);
  p.set("city", q.city);
  p.set("checkIn", q.checkIn);
  p.set("checkOut", q.checkOut);
  p.set("adults", String(q.adults));
  return `/hotels/online/${encodeURIComponent(i.online.property_id)}?${p.toString()}`;
}

export const faDigits = (v: string | number) =>
  String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/** عدد فارسی فشرده: ۱۹.۵ م / ۸۵۰ هزار */
export function compactToman(n: number): string {
  if (n >= 1_000_000_000)
    return faDigits((n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")) + " میلیارد";
  if (n >= 1_000_000)
    return faDigits((n / 1_000_000).toFixed(1).replace(/\.0$/, "")) + " م";
  if (n >= 1_000) return faDigits(Math.round(n / 1_000)) + " هزار";
  return faDigits(n);
}

/** کلید یکتای هر هتل (برای علاقه‌مندی و نقشه) */
export function hotelKey(i: UnifiedHotel): string {
  return i.source === "site"
    ? `site-${i.site!.id}`
    : `online-${i.online!.property_id}`;
}

/** نام‌های قابل جستجو (فارسی + انگلیسی) */
export function hotelNames(i: UnifiedHotel): string[] {
  const out: string[] = [];
  if (i.site) {
    out.push(i.site.title);
    if (i.site.title_en) out.push(i.site.title_en);
  }
  if (i.online) out.push(i.online.name);
  return out;
}

export function hotelStars(i: UnifiedHotel): number {
  return i.source === "site" ? i.site!.stars : i.online!.stars ?? 0;
}

export function hotelRating(i: UnifiedHotel): number {
  return i.source === "site"
    ? i.site!.rating || i.online?.rating || 0
    : i.online!.rating;
}

export function hotelReviews(i: UnifiedHotel): number {
  return i.online?.reviews ?? 0;
}

export function hotelAmenities(i: UnifiedHotel): string[] {
  return i.source === "site" ? i.site!.amenities : i.online!.amenities ?? [];
}

export function hotelCoords(i: UnifiedHotel): { lat: number; lng: number } | null {
  const lat = i.source === "site" ? i.site!.lat : i.online!.lat;
  const lng = i.source === "site" ? i.site!.lng : i.online!.lng;
  return lat && lng ? { lat, lng } : null;
}

/* ═══════════════════════════════════════════════════════
   نگاشت امکانات به فارسی
   ═══════════════════════════════════════════════════════ */

export const AMENITY_FA: Record<string, string> = {
  free_wi_fi: "وای‌فای رایگان",
  wifi: "وای‌فای",
  free_parking: "پارکینگ رایگان",
  parking: "پارکینگ",
  pools: "استخر",
  pool: "استخر",
  hot_tub: "وان آب گرم",
  air_conditioning: "تهویه مطبوع",
  fitness_center: "باشگاه ورزشی",
  gym: "باشگاه ورزشی",
  spa: "اسپا و ماساژ",
  bar: "بار",
  restaurant: "رستوران",
  room_service: "سرویس اتاق",
  kitchen_in_some_rooms: "آشپزخانه در برخی اتاق‌ها",
  full_service_laundry: "خشکشویی",
  accessible: "دسترسی معلولین",
  business_center: "مرکز تجاری",
  kid_friendly: "مناسب کودکان",
  smoke_free_property: "بدون سیگار",
  pet_friendly: "پذیرش حیوانات",
  airport_shuttle: "سرویس فرودگاه",
  breakfast: "صبحانه",
  breakfast_: "صبحانه",
};

/* ═══════════════════════════════════════════════════════
   تابع جستجوی هتل
   ═══════════════════════════════════════════════════════ */

export async function searchHotels(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
}): Promise<HotelsSearchResult | null> {
  const url = new URL(buildApiUrl("/nextsafar/v1/hotels/search"));

  url.searchParams.set("city", params.city);
  url.searchParams.set("check_in", params.checkIn);
  url.searchParams.set("check_out", params.checkOut);
  url.searchParams.set("adults", String(params.adults ?? 2));
  url.searchParams.set("children", String(params.children ?? 0));

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("searchHotels: HTTP error", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("searchHotels exception:", err);
    return null;
  }
}