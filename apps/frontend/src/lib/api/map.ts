import type { NearbyResponse, TripEntity } from "@/types/map";
import { buildApiUrl } from "./config";

/* ═══════════════════════════════════════════════════════════
   ✅ تنظیمات کاشی از بک‌اند + کش مرورگر ۱ ساعته
═══════════════════════════════════════════════════════════ */
export interface MapTileConfig {
  provider: string;
  tile_url: string;
  fallback_url: string;
  attribution: string;
  max_zoom: number;
}

let tileCfg: MapTileConfig | null = null;

export async function getMapConfig(): Promise<MapTileConfig> {
  if (tileCfg) return tileCfg;

  const fallback: MapTileConfig = {
    provider: "osm",
    tile_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    fallback_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    max_zoom: 19,
  };

  /* کش مرورگر */
  try {
    const raw = localStorage.getItem("ns_map_cfg");
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.cfg && p.ts && Date.now() - p.ts < 3_600_000) {
        tileCfg = p.cfg as MapTileConfig;
        return tileCfg;
      }
    }
  } catch {}

  /* ✅ FIX: استفاده از buildApiUrl به‌جای WP */
  try {
    const res = await fetch(buildApiUrl("nextsafar/v1/map/config"), {
      cache: "no-store",
    });
    if (res.ok) {
      const cfg = (await res.json()) as MapTileConfig;
      tileCfg = cfg;
      try {
        localStorage.setItem("ns_map_cfg", JSON.stringify({ ts: Date.now(), cfg }));
      } catch {}
      return cfg;
    }
  } catch {}

  return fallback;
}

/* ═══ legacy — موجودیت‌ها از refs مستقیم ═══ */
export async function getTripEntities(
  refs: { type: string; slug: string }[],
): Promise<TripEntity[]> {
  if (!refs.length) return [];
  const q = refs.map((r) => `${r.type}:${r.slug}`).join(",");
  try {
    const res = await fetch(
      buildApiUrl(`nextsafar/v1/map/entities?refs=${encodeURIComponent(q)}`),
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.entities ?? [];
  } catch {
    return [];
  }
}

/* ═══ مختصات یک پست (کش ۱ ساعته) ═══ */
export async function getPostCoords(
  postType: string,
  slug: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      buildApiUrl(
        `nextsafar/v1/map/coords?post_type=${postType}&slug=${encodeURIComponent(slug)}`,
      ),
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.has_coords ? { lat: data.lat, lng: data.lng } : null;
  } catch {
    return null;
  }
}

/* ═══ مکان‌های نزدیک ═══ */
export async function getNearbyPlaces(params: {
  lat: number;
  lng: number;
  radius?: number;
  types?: string[];
  exclude?: number;
  limit?: number;
}): Promise<NearbyResponse | null> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius: String(params.radius ?? 5),
    types: (params.types ?? []).join(","),
    exclude: String(params.exclude ?? 0),
    limit: String(params.limit ?? 12),
  });
  try {
    const res = await fetch(buildApiUrl(`nextsafar/v1/map/nearby?${q}`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const nearbyCache = new Map<string, { ts: number; data: any }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function getNearbyForPost(params: {
  postType: string;
  slug: string;
  radius?: number;
  limit?: number;
}): Promise<(NearbyResponse & { has_center: boolean }) | null> {
  const key = `${params.postType}/${params.slug}/${params.radius ?? 5}`;
  const hit = nearbyCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  const q = new URLSearchParams({
    post_type: params.postType,
    slug: params.slug,
    radius: String(params.radius ?? 5),
    limit: String(params.limit ?? 12),
  });
  try {
    const res = await fetch(buildApiUrl(`nextsafar/v1/map/nearby?${q}`));
    if (!res.ok) return null;
    const data = await res.json();
    nearbyCache.set(key, { ts: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

/* ═══ ✅ موجودیت‌های برنامه سفر ═══ */
export async function getPlanEntities(planId: number): Promise<TripEntity[]> {
  try {
    const res = await fetch(
      buildApiUrl(`nextsafar/v1/ai-trip-planner/plan-entities?id=${planId}`),
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.entities ?? [];
  } catch {
    return [];
  }
}