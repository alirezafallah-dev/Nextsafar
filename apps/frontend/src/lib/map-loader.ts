/**
 * ✅ تنها نقطه لود Leaflet: CSS + JS یک‌بار و کش‌شده
 * ریشه مشکل «نقشه نامرئی»: CSS لیفلت هرگز لود نمی‌شد
 */
let leafletPromise: Promise<any> | null = null;

export function loadLeaflet(): Promise<any> {
  if (!leafletPromise) {
    leafletPromise = (async () => {
      await import("leaflet/dist/leaflet.css");
      const mod = await import("leaflet");
      return (mod as any).default ?? mod;
    })();
  }
  return leafletPromise;
}

/** انتظار تا ظرف نقشه ارتفاع واقعی پیدا کند */
export function waitForSize(el: HTMLElement, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (el.offsetHeight > 0 || el.offsetWidth > 0) return resolve();
      if (Date.now() - start > timeoutMs) return resolve();
      requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * ✅ invalidateSize زمان‌بندی‌شده با قابلیت لغو
 * جلوگیری از خطای "_leaflet_pos" وقتی کامپوننت unmount می‌شود
 */
export function scheduleFix(map: any, delays = [80, 300, 800]): () => void {
  const ids = delays.map((d) =>
    setTimeout(() => {
      try {
        map?.invalidateSize();
      } catch {}
    }, d),
  );
  return () => ids.forEach((id) => clearTimeout(id));
}