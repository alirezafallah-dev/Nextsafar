import { buildApiUrl } from "./config";
import type { MenuItem } from "@/types/menu";

const cache = new Map<string, MenuItem[]>();

export async function getMenus(slug: string): Promise<MenuItem[]> {
  if (cache.has(slug)) return cache.get(slug)!;
  try {
    const res = await fetch(buildApiUrl(`/nextsafar/v1/menus/${slug}`), {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[menus] ${slug} → HTTP ${res.status}`);
      cache.set(slug, []);
      return [];
    }
    const data = await res.json();
    const items: MenuItem[] = Array.isArray(data) ? data : (data?.items ?? []);
    cache.set(slug, items);
    return items;
  } catch (e) {
    console.warn(`[menus] ${slug} → network error`);
    cache.set(slug, []);
    return [];
  }
}