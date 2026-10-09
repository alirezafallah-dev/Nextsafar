import type { PostType, TaxonomyType } from "@/types/api";
import { buildApiUrl } from "./config";

// ========================== WordPress Base ==========================
async function wpFetch<T>(
  endpoint: string,
  params?: Record<string, any>,
): Promise<T> {
  /* ✅ FIX: استفاده از buildApiUrl به‌جای WP_API_URL */
  const url = new URL(buildApiUrl(endpoint));
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, /* کش ۱ ساعته */
  });

  if (!response.ok) {
    throw new Error(`WP API Error: ${response.status} - ${endpoint}`);
  }
  return response.json();
}

// ========================== Helper: Meta Field Extraction ==========================
export function getMetaValue(post: any, key: string, defaultValue: any = "") {
  if (post.acf && post.acf[key] !== undefined) return post.acf[key];
  if (post[key] !== undefined) return post[key];
  if (post.meta && post.meta[key] !== undefined) return post.meta[key];
  return defaultValue;
}

export function getTermMeta(term: any, key: string, defaultValue: any = "") {
  if (term.acf && term.acf[key] !== undefined) return term.acf[key];
  if (term.meta && term.meta[key] !== undefined) return term.meta[key];
  return defaultValue;
}

// ========================== Generic Post Fetchers ==========================
export async function getPosts<T = any>(
  postType: PostType,
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    _embed?: boolean;
    orderby?: string;
    order?: "asc" | "desc";
  } = {},
) {
  const data = await wpFetch<T[]>(`/wp/v2/${postType}`, {
    _embed: "true",
    per_page: params.per_page || 12,
    page: params.page || 1,
    search: params.search,
    orderby: params.orderby || "date",
    order: params.order || "desc",
  });
  return data;
}

export async function getPostBySlug<T = any>(postType: PostType, slug: string) {
  const data = await wpFetch<T[]>(`/wp/v2/${postType}`, {
    slug,
    _embed: "true",
  });
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

export async function getPostById<T = any>(postType: PostType, id: number) {
  return wpFetch<T>(`/wp/v2/${postType}/${id}`, { _embed: "true" });
}

// ========================== Taxonomy Fetchers ==========================
export async function getTerms<T = any>(taxonomy: TaxonomyType, params: any = {}) {
  return wpFetch<T[]>(`/wp/v2/${taxonomy}`, {
    per_page: params.per_page || 100,
    hide_empty: params.hide_empty ?? true,
    ...params,
  });
}

export async function getTermBySlug<T = any>(taxonomy: TaxonomyType, slug: string) {
  const data = await wpFetch<T[]>(`/wp/v2/${taxonomy}`, { slug });
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

// ========================== Specialized Fetchers ==========================
export async function getHotelsByLocation(location: string) {
  return getPosts("hotel", { search: location, per_page: 50 });
}

export async function getDestinationsByCity(city: string) {
  return getPosts("destination", { search: city, per_page: 50 });
}

export async function getNewsByCategory(category: string) {
  return getPosts("travelnews", { search: category, per_page: 20 });
}

export async function getPopularDestinations(limit = 6) {
  return getPosts("destination", { per_page: limit, orderby: "date" });
}

export async function getLatestNews(limit = 6) {
  return getPosts("travelnews", { per_page: limit, orderby: "date" });
}

// ========================== Image Helpers ==========================
export function getFeaturedImage(post: any): string {
  if (!post) return "/images/placeholder.jpg";
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  if (featured?.source_url) return featured.source_url;
  if (featured?.media_details?.sizes?.large?.source_url) {
    return featured.media_details.sizes.large.source_url;
  }
  return "/images/placeholder.jpg";
}

export function getTermImage(term: any): string {
  if (!term) return "/images/placeholder.jpg";
  const image =
    getTermMeta(term, "_tourism_image") || getTermMeta(term, "term_flag");
  if (image) return image;
  return "/images/placeholder.jpg";
}

// ========================== URL Builders ==========================
/* ✅ FIX: فاصله‌های اضافی حذف + مسیرها هم‌راستا با استاندارد سایت
   (/visas، /travel-guides، /travel-news — مطابق لینک‌های صفحه اصلی) */
export function buildPostUrl(post: any): string {
  if (!post) return "#";
  const slug = post.slug;
  const typeMap: Record<PostType, string> = {
    hotel: "/hotels",
    restaurant: "/restaurants",
    airport: "/airports",
    hospital: "/hospitals",
    destination: "/destinations",
    tour: "/tours",
    visa: "/visas",
    travelguide: "/travel-guides",
    travelnews: "/travel-news",
    post: "/blog",
  };
  const prefix = typeMap[post.type as PostType] || "";
  return `${prefix}/${slug}`;
}

export function buildTermUrl(term: any): string {
  if (!term) return "#";
  const slug = term.slug;
  const taxonomy = term.taxonomy;

  /* ✅ شهر توریستی → صفحه کالکشن (همون مسیر استاندارد /tourism/[slug]) */
  if (taxonomy === "tourism") return `/tourism/${slug}`;

  /* بقیه تاکسونومی‌ها → فیلتر روی صفحه آرشیو */
  const taxMap: Record<string, string> = {
    hotel_category: "/hotels",
    restaurant_category: "/restaurants",
    airport_category: "/airports",
    hospital_category: "/hospitals",
    destination_category: "/destinations",
    tour_category: "/tours",
    visa_category: "/visas",
    travelguide_category: "/travel-guides",
    travelnews_category: "/travel-news",
  };
  const prefix = taxMap[taxonomy] || "";
  return `${prefix}?category=${slug}`;
}