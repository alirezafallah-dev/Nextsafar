import type { BudgetLevel, TripInput, TripEntityType } from "@/types/ai-trip";

/** مقدار پیش‌فرض فرم برنامه سفر */
export const DEFAULT_INPUT: TripInput = {
  destination: "",
  country: "",
  days: 3,
  travelers: 2,
  start_date: null,
  budget_level: "medium",
  interests: [],
};

/** گزینه‌های سطح بودجه */
export const BUDGET_OPTIONS: {
  value: BudgetLevel;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { value: "economy", label: "اقتصادی", desc: "به‌صرفه و هوشمندانه", emoji: "💰" },
  { value: "medium", label: "متوسط", desc: "تعادل بین هزینه و کیفیت", emoji: "⚖️" },
  { value: "luxury", label: "لوکس", desc: "بهترین هتل‌ها و خدمات", emoji: "👑" },
];

/** علاقه‌مندی‌های قابل انتخاب (حداکثر ۵ مورد) */
export const INTEREST_OPTIONS: string[] = [
  "تاریخی و فرهنگی",
  "غذا و رستوران",
  "طبیعت‌گردی",
  "خرید",
  "تفریح و سرگرمی",
  "استراحت و ساحل",
  "موزه و هنر",
  "مذهبی",
];

/** نگاشت نوع موجودیت به مسیر صفحات سایت (برای ساخت لینک) */
export const ENTITY_URLS: Record<Exclude<TripEntityType, "custom">, string> = {
  hotel: "/hotels/",
  restaurant: "/restaurants/",
  destination: "/destinations/",
  tour: "/tours/",
};