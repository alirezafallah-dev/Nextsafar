/* ═══════════════════════════════════════════════════════
   NextSafar — دیتای سکشن‌های صفحه اصلی
═══════════════════════════════════════════════════════ */
import { buildApiUrl } from "./config";

export const HOME_ROUTES = {
  visa: "wp/v2/visa",
  guide: "wp/v2/travelguide",
  news: "wp/v2/travelnews",
  tourism: "wp/v2/tourism",
  destination: "wp/v2/destination",
} as const;

const REVALIDATE = 600; /* کش ۱۰ دقیقه‌ای ISR */

export interface HomePost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  category: string | null;
  date: string | null;
  price_min: number | null;
  currency: string | null;
  issue: string | null;
}

export interface HomeTerm {
  id: number;
  slug: string;
  name: string;
  country: string | null; /* ✅ نام والد (کشور) */
  count: number;
  image: string | null;
}

/* ═══ fetch ایمن ═══ */
async function wp<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(buildApiUrl(path), {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function embedImage(post: any): string | null {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  if (!media || media.media_type !== "image") return null;
  return media?.media_details?.sizes?.large?.source_url ?? media?.source_url ?? null;
}

function embedCategory(post: any): string | null {
  const terms = post?._embedded?.["wp:term"];
  if (!Array.isArray(terms) || !terms[0]?.length) return null;
  return terms[0][0]?.name ?? null;
}

function mapPost(p: any): HomePost {
  const info = p?.visa_info;
  return {
    id: p.id,
    slug: p.slug,
    title: strip(p?.title?.rendered ?? ""),
    excerpt: strip(p?.excerpt?.rendered ?? "").slice(0, 120),
    image: embedImage(p),
    category: embedCategory(p),
    date: p?.date ?? null,
    price_min: typeof info?.price_min === "number" ? info.price_min : null,
    currency: typeof info?.currency === "string" && info.currency ? info.currency : null,
    issue: typeof info?.issue === "string" && info.issue ? info.issue : null,
  };
}

/* ═══ ✅ تصویر ترم: همه کلیدهای محتمل (همون کلیدهایی که wordpress.ts استفاده می‌کنه) ═══ */
function termImage(t: any): string | null {
  const m = t?.meta ?? {};
  return (
    t?.image ??
    t?.image_url ??
    t?.term_image ??
    m?.image ??
    m?._tourism_image ??
    m?._term_image ??
    m?.term_flag ??
    null
  );
}

/* ═══ ✅ فال‌بک تصویر: تصویر شاخص اولین پست مقصدِ هر شهر (یک درخواست دسته‌ای) ═══ */
async function getTermImagesFromPosts(
  termIds: number[],
): Promise<Record<number, string>> {
  if (!termIds.length) return {};
  const q = new URLSearchParams({ per_page: "50", _embed: "true" });
  termIds.forEach((id) => q.append("tourism[]", String(id)));

  const posts = await wp<any[]>(`${HOME_ROUTES.destination}?${q}`);
  const out: Record<number, string> = {};

  for (const p of posts ?? []) {
    const img = embedImage(p);
    if (!img) continue;
    const groups: any[][] = p?._embedded?.["wp:term"] ?? [];
    for (const group of groups) {
      for (const term of group ?? []) {
        if (
          term?.taxonomy === "tourism" &&
          termIds.includes(term.id) &&
          !out[term.id]
        ) {
          out[term.id] = img;
        }
      }
    }
  }
  return out;
}

/* ═══ ✅ کالکشن‌ها: فقط شهرها (فرزندها) + نام کشور والد ═══ */
export async function getTourismTerms(count = 8): Promise<HomeTerm[]> {
  const raw = await wp<any[]>(
    `${HOME_ROUTES.tourism}?per_page=100&orderby=count&order=desc&hide_empty=true`,
  );
  if (!raw?.length) return [];

  const byId = new Map<number, any>(raw.map((t) => [t.id, t]));

  /* ✅ فقط فرزندها — والد ریشه (parent=0 = کشورها) نمایش داده نمی‌شن */
  const cities = raw.filter((t) => (t.parent ?? 0) > 0);
  if (!cities.length) return [];

  const top = cities.slice(0, count);
  const missing = top.filter((t) => !termImage(t)).map((t) => t.id);
  const fallback = missing.length ? await getTermImagesFromPosts(missing) : {};

  return top.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: strip(t.name ?? ""),
    country: byId.get(t.parent)?.name ? strip(byId.get(t.parent).name) : null,
    count: t.count ?? 0,
    image: termImage(t) ?? fallback[t.id] ?? null,
  }));
}

/* ═══ ویزا ═══ */
export async function getVisaPosts(count = 8): Promise<HomePost[]> {
  const raw = await wp<any[]>(
    `${HOME_ROUTES.visa}?per_page=${count}&_embed&orderby=date&order=desc`,
  );
  return (raw ?? []).map(mapPost);
}

/* ═══ راهنمای سفر ═══ */
export async function getGuidePosts(count = 4): Promise<HomePost[]> {
  const raw = await wp<any[]>(
    `${HOME_ROUTES.guide}?per_page=${count}&_embed&orderby=date&order=desc`,
  );
  return (raw ?? []).map(mapPost);
}

/* ═══ اخبار ═══ */
export async function getNewsPosts(count = 6): Promise<HomePost[]> {
  const raw = await wp<any[]>(
    `${HOME_ROUTES.news}?per_page=${count}&_embed&orderby=date&order=desc`,
  );
  return (raw ?? []).map(mapPost);
}

/* ═══ فرمت‌های فارسی ═══ */
export function formatFa(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function formatFaDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}