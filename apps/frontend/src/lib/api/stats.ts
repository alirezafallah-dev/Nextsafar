/* ═══════════════════════════════════════════════════════════
   آمار زنده سایت
   ۱) اول endpoint اختصاصی پلاگین
   ۲) فال‌بک: تست چند rest_base احتمالی
═══════════════════════════════════════════════════════════ */
import { buildApiUrl } from "./config";

export type SiteStats = Record<string, number>;

export async function getSiteStats(): Promise<SiteStats> {
  /* ─── روش ۱: endpoint اختصاصی ─── */
  try {
    /* ✅ FIX: استفاده از buildApiUrl به‌جای WP_API_URL */
    const res = await fetch(buildApiUrl("nextsafar/v1/stats"), {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.counts) return data.counts as SiteStats;
    }
  } catch {
    /* رفت به فال‌بک */
  }

  /* ─── روش ۲: فال‌بک با چند rest_base احتمالی ─── */
  /* ✅ FIX: فاصله‌های اضافی داخل رشته‌ها حذف شد (باعث ۴۰۴ می‌شد) */
  const candidates: Record<string, string[]> = {
    hotel: ["hotel", "hotels"],
    destination: ["destination", "destinations"],
    tour: ["tour", "tours"],
    visa: ["visa", "visas"],
    travelguide: ["travelguide", "travelguides", "travel-guide"],
    restaurant: ["restaurant", "restaurants"],
  };

  const out: SiteStats = {};
  await Promise.all(
    Object.entries(candidates).map(async ([key, bases]) => {
      for (const base of bases) {
        const n = await getCountByBase(base);
        if (n !== null) {
          out[key] = n;
          return;
        }
      }
      out[key] = 0;
    }),
  );
  return out;
}

async function getCountByBase(base: string): Promise<number | null> {
  try {
    const res = await fetch(buildApiUrl(`wp/v2/${base}?per_page=1&_fields=id`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const total = res.headers.get("x-wp-total");
    return total ? parseInt(total, 10) : 0;
  } catch {
    return null;
  }
}