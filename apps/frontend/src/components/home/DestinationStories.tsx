import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StoriesCarousel, { StoryItem } from "./StoriesCarousel";
import { getBestImageUrl, IMG_TARGETS } from "@/lib/utils/image";
import { buildApiUrl } from "@/lib/api/config";
import SectionHeader from "./SectionHeader";

/* ═══ استخراج هوشمند نام مکان ═══ */
function extractPlace(post: any): string {
  const cats = post._embedded?.["wp:term"]?.[0];
  if (cats && cats.length > 0) {
    return cats[0].name || "";
  }
  const acf = post.acf || {};
  const meta = post.meta || {};
  if (acf.country) return acf.country;
  if (acf.city) return acf.city;
  if (meta.country) return meta.country;
  if (meta.city) return meta.city;
  const title = (post.title?.rendered || " ").replace(/<[^>]+>/g, " ").trim();
  const knownCities = [
    "استانبول", "دبی", "کیش", "مشهد", "شیراز", "اصفهان", "تهران",
    "آنتالیا", "بالی", "تفلیس", "باتومی", "پاریس", "رم", "بارسلونا",
    "Istanbul", "Dubai", "Kish", "Mashhad", "Shiraz", "Isfahan", "Tehran",
  ];
  for (const city of knownCities) {
    if (title.includes(city)) return city;
  }
  return "";
}

/* ═══ fetch ایمن بدون پرتاب Error ═══ */
async function fetchDestinations(): Promise<any[]> {
  try {
    const url = buildApiUrl("wp/v2/destination?per_page=12&_embed");
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

export default async function DestinationStories() {
  const posts = await fetchDestinations();
  
  const items: StoryItem[] = posts
    .map((p: any) => {
      const media = p._embedded?.["wp:featuredmedia"]?.[0];
      return {
        slug: p.slug,
        title: (p.title?.rendered || " ").replace(/<[^>]+>/g, " ").trim(),
        image: getBestImageUrl(media, IMG_TARGETS.story),
        place: extractPlace(p),
      };
    })
    .filter((i: StoryItem) => i.image && i.title);

  if (items.length === 0) return null;


// ...

return (
  <section className="ns-container mt-14 md:mt-20">
    <SectionHeader
      title="امروز کجا بریم؟"
      subtitle="مقاصد و جاذبه‌هایی که همین حالا ترند هستند"
      href="/destinations"
    />
    <StoriesCarousel items={items} />
  </section>
);
}