/* ═══════════════════════════════════════════════════════════
   سیستم سایزبندی تصاویر — NextSafar
═══════════════════════════════════════════════════════════ */

export const IMG_TARGETS = {
  hero: 1600,
  story: 640,
  card: 800,
  thumb: 256,
} as const;

interface MediaSize {
  width: number;
  source_url: string;
}

interface Media {
  source_url?: string;
  media_details?: { sizes?: Record<string, MediaSize> };
}

export function getBestImageUrl(
  media: Media | null | undefined,
  targetWidth: number,
): string {
  if (!media) return "";

  const full = media.source_url || "";
  const sizes = media.media_details?.sizes;

  if (!sizes) return full;

  const available = Object.values(sizes)
    .filter((s) => s?.source_url && typeof s.width === "number")
    .sort((a, b) => a.width - b.width);

  if (available.length === 0) return full;

  const best =
    available.find((s) => s.width >= targetWidth) ??
    available[available.length - 1];

  return best.source_url || full;
}
