/* ═══════════════════════════════════════════════════════
   NextSafar — پیکربندی مرکزی API
   تمام فایل‌های API باید از این تابع استفاده کنند
═══════════════════════════════════════════════════════ */

/**
 * دریافت URL اصلی API وردپرس
 * اولویت: WP_API_URL (سرور) > NEXT_PUBLIC_WP_API_URL (کلاینت) > fallback
 */
export function getApiUrl(): string {
  return (
    process.env.WP_API_URL ||
    process.env.NEXT_PUBLIC_WP_API_URL ||
    "http://nextsafar.local/wp-json"
  );
}

/**
 * دریافت URL کامل endpoint
 * @example buildApiUrl('visa?per_page=8')
 */
export function buildApiUrl(path: string): string {
  const base = getApiUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

/**
 * بررسی اینکه در سمت سرور هستیم یا کلاینت
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}