"use client";
import { useSyncExternalStore } from "react";

const KEY = "ns_fav_hotels";

export interface FavMeta {
  source: string;
  title: string;
  image: string | null;
  url: string | null;
}

export interface FavItem extends FavMeta {
  key: string;
  ts: number;
}

let items: FavItem[] | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: FavItem[] = [];

function readItems(): FavItem[] {
  if (items) return items;
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    items = Array.isArray(raw) ? raw : [];
  } catch {
    items = [];
  }
  return items;
}

function write(next: FavItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
  syncToServer(next);
}

/* ═══ همگام‌سازی با سرور (با retry) ═══ */
let syncing = false;
let retryCount = 0;
const MAX_RETRIES = 3;

async function syncToServer(list: FavItem[]): Promise<void> {
  if (syncing || typeof window === "undefined") return;
  syncing = true;
  
  try {
    const res = await fetch("/api/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: list }),
    });
    
    if (!res.ok) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(r => setTimeout(r, 1000 * retryCount));
        syncing = false;
        return syncToServer(list);
      }
      console.warn("[Favorites] Sync failed after retries");
      return;
    }
    
    retryCount = 0;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      await new Promise(r => setTimeout(r, 1000 * retryCount));
      syncing = false;
      return syncToServer(list);
    }
    console.warn("[Favorites] Sync error:", err);
  } finally {
    syncing = false;
  }
}

/** دریافت از سرور — فقط یکبار در هر session */
let pullExecuted = false;

export async function pullFromServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (pullExecuted) return;
  
  pullExecuted = true;
  
  try {
    const res = await fetch("/api/favorites/sync", {
      credentials: "include",
      cache: "no-store",
    });
    
    if (!res.ok) return;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.items)) return;
    
    const local = readItems();
    const serverItems = data.items as FavItem[];
    
    // ✅ Merge دو طرفه: هم اضافه کن، هم حذف کن
    const localMap = new Map(local.map(i => [i.key, i]));
    const serverMap = new Map(serverItems.map(i => [i.key, i]));
    
    let changed = false;
    
    // اضافه کردن آیتم‌های جدید از سرور
    for (const [key, item] of serverMap) {
      if (!localMap.has(key)) {
        localMap.set(key, item);
        changed = true;
      }
    }
    
    // حذف آیتم‌هایی که در سرور نیستند
    for (const key of localMap.keys()) {
      if (!serverMap.has(key)) {
        localMap.delete(key);
        changed = true;
      }
    }
    
    if (changed) {
      items = Array.from(localMap.values());
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
      listeners.forEach((l) => l());
    }
  } catch (err) {
    console.warn("[Favorites] Pull error:", err);
  }
}

/* ═══ toggle با متادیتا ═══ */
export function toggleFavorite(key: string, meta?: FavMeta) {
  const cur = readItems();
  const exists = cur.some((i) => i.key === key);
  
  const next = exists
    ? cur.filter((i) => i.key !== key)
    : [
        ...cur,
        {
          key,
          ts: Date.now(),
          source: meta?.source ?? "",
          title: meta?.title ?? "",
          image: meta?.image ?? null,
          url: meta?.url ?? null,
        },
      ];
  
  write(next);
}

export function useFavorites() {
  const store = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => readItems(),
    () => SERVER_SNAPSHOT,
  );
  const favs = store.map((i) => i.key);
  const has = (id: string) => favs.includes(id);
  return { favs, items: store, toggle: toggleFavorite, has };
}