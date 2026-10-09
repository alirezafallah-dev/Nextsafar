import { getPosts } from "@/lib/api/wordpress";
import { buildApiUrl } from "@/lib/api/config";
import { getBestImageUrl, IMG_TARGETS } from "@/lib/utils/image";
import TrendingClient from "./TrendingClient";
import type { HotelItem, TourCatItem } from "./TrendingClient";

const clean = (s: any) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, "")
    .trim();

function pickMeta(p: any, keys: string[]): any {
  for (const k of keys) {
    const v = p.meta?.[k] ?? p.acf?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

/* ═══ شهر هتل از چند منبع ═══ */
function extractHotelCity(p: any): string {
  const metaCity = pickMeta(p, ["_hotel_city", "_geo_city", "city"]);
  if (metaCity) return clean(metaCity);
  const hotelCats = p._embedded?.["wp:term"]?.find(
    (arr: any) => Array.isArray(arr) && arr[0]?.taxonomy === "hotel_category",
  );
  if (hotelCats?.length) return clean(hotelCats[0].name);
  const tourism = p._embedded?.["wp:term"]?.find(
    (arr: any) => Array.isArray(arr) && arr[0]?.taxonomy === "tourism",
  );
  if (tourism?.length) return clean(tourism[0].name);
  return clean(p._embedded?.["wp:term"]?.[0]?.[0]?.name) || "";
}

/* ═══ دسته‌بندی تور: کوچک‌ترین دسته‌ها + تصویر از REST Field ═══ */
async function getTourCategories(): Promise<TourCatItem[]> {
  try {
    const res = await fetch(
      buildApiUrl("wp/v2/tour_category?per_page=30&orderby=count&order=desc"),
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const terms: any[] = await res.json();
    return terms
      .filter((t) => t.count > 0 && t.name)
      .slice(0, 8)
      .map((t) => ({
        slug: decodeURIComponent(t.slug),
        name: clean(t.name),
        count: t.count,
        image: t.ns_term_image ?? null,
        duration: t.ns_tour_info?.duration
          ? Number(t.ns_tour_info.duration)
          : null,
      }));
  } catch (e) {
    console.error("Tour categories error:", e);
    return [];
  }
}

export default async function TrendingNow() {
  const [hotelPosts, tourCats] = await Promise.all([
    getPosts("hotel", { per_page: 8, orderby: "date", order: "desc" }).catch(
      () => [],
    ),
    getTourCategories(),
  ]);

  const hotels: HotelItem[] = (hotelPosts as any[])
    .map((p) => ({
      slug: p.slug,
      title: clean(p.title?.rendered),
      image:
        getBestImageUrl(p._embedded?.["wp:featuredmedia"]?.[0], IMG_TARGETS.card) ||
        null,
      stars: Number(pickMeta(p, ["_hotel_stars", "stars"])) || null,
      city: extractHotelCity(p),
      price: Number(pickMeta(p, ["_hotel_price", "price"])) || null,
      rating: Number(pickMeta(p, ["_hotel_rating", "rating"])) || null,
    }))
    .filter((i) => i.title);

  if (!hotels.length && !tourCats.length) return null;

  return (
    <section className="ns-container py-8 md:py-12">
      <TrendingClient hotels={hotels} tourCats={tourCats} />
    </section>
  );
}