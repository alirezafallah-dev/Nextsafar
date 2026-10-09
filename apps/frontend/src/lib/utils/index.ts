import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========================== Number Formatting ==========================
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}

// ========================== RTL Detection ==========================
export function isRTL(locale: string): boolean {
  return ["fa", "ar"].includes(locale);
}

export function getDirection(locale: string): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}

// ========================== Date Formatting ==========================
export function formatDate(
  date: string | Date,
  locale: string = "fa-IR",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function timeAgo(date: string | Date, locale: string = "fa-IR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals = [
    { label: locale === "fa-IR" ? "سال" : "year", seconds: 31536000 },
    { label: locale === "fa-IR" ? "ماه" : "month", seconds: 2592000 },
    { label: locale === "fa-IR" ? "هفته" : "week", seconds: 604800 },
    { label: locale === "fa-IR" ? "روز" : "day", seconds: 86400 },
    { label: locale === "fa-IR" ? "ساعت" : "hour", seconds: 3600 },
    { label: locale === "fa-IR" ? "دقیقه" : "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return locale === "fa-IR"
        ? `${formatNumber(count)} ${interval.label} پیش`
        : `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return locale === "fa-IR" ? "همین الان" : "just now";
}

// ========================== String Helpers ==========================
export function truncate(str: string, maxLength: number): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim() + "...";
}

export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function excerpt(content: string, maxLength: number = 150): string {
  const plain = stripHtml(content);
  return truncate(plain, maxLength);
}

// ========================== Rating ==========================
export function ratingToStars(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating)));
}

export function ratingToLabel(rating: number): { text: string; color: string } {
  if (rating >= 9) return { text: "فوق‌العاده", color: "bg-green-500" };
  if (rating >= 8) return { text: "عالی", color: "bg-green-400" };
  if (rating >= 7) return { text: "خوب", color: "bg-blue-500" };
  if (rating >= 6) return { text: "متوسط", color: "bg-yellow-500" };
  if (rating >= 4) return { text: "ضعیف", color: "bg-orange-500" };
  return { text: "بسیار ضعیف", color: "bg-red-500" };
}

// ========================== Coordinates ==========================
export function parseCoords(
  coords: string,
): { lat: number; lng: number } | null {
  if (!coords) return null;
  const parts = coords.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  return { lat: parts[0], lng: parts[1] };
}

export function buildGoogleMapsUrl(coords: string): string {
  const parsed = parseCoords(coords);
  if (!parsed) return "#";
  return `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}`;
}

// ========================== Phone ==========================
export function formatPhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export function telLink(phone: string): string {
  return `tel:${formatPhone(phone)}`;
}

// ========================== Slug ==========================
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
