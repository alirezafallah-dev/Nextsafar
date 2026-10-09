/* ═══════════════════════════════════════════════════════════
   تایپ‌های برنامه‌ریز سفر هوشمند (AI Trip Planner)
   هماهنگ با اسکیمای بک‌اند: ai-trip-planner-endpoint.php
═══════════════════════════════════════════════════════════ */

/** سطح بودجه سفر */
export type BudgetLevel = "economy" | "medium" | "luxury";

/** وضعیت پردازش برنامه (هماهنگ با فیلد status دیتابیس) */
export type TripStatus = "pending" | "completed" | "failed" | "expired";

/** نوع فعالیت در هر روز (هماهنگ با enum بک‌اند) */
export type ActivityType =
  | "visit"
  | "food"
  | "hotel"
  | "transport"
  | "activity"
  | "shopping"
  | "rest";

/** نوع موجودیت لینک‌شده به صفحات سایت */
export type TripEntityType =
  | "hotel"
  | "restaurant"
  | "destination"
  | "tour"
  | "custom";

/** ورودی کاربر برای ساخت برنامه */
export interface TripInput {
  destination: string;
  country: string;
  days: number;
  travelers: number;
  start_date: string | null;
  budget_level: BudgetLevel;
  interests: string[];
}

/** یک فعالیت در برنامه روزانه */
export interface TripActivity {
  time: string;
  title: string;
  description: string;
  type: ActivityType;
  slug?: string;
  entity_type?: TripEntityType;
}

/** برنامه یک روز کامل */
export interface TripDay {
  day_number: number;
  title: string;
  theme: string;
  activities: TripActivity[];
  budget_min: number;
  budget_max: number;
  tip_of_day?: string;
}

/** هتل پیشنهادی */
export interface RecommendedHotel {
  title: string;
  slug?: string;
  reason: string;
}

/** متادیتای برنامه */
export interface TripMeta {
  model_used?: string;
  tokens_used?: number;
  generation_time_ms?: number;
  created_at?: string;
  view_count?: number;
  error_message?: string | null;
}

/** برنامه سفر کامل */
export interface TripPlan {
  id: number;
  status: TripStatus;
  attempts?: number;
  title: string;
  summary: string;
  days: TripDay[];
  tips: string[];
  total_budget_min: number | null;
  total_budget_max: number | null;
  currency: string;
  recommended_hotel: RecommendedHotel | null;
  input?: TripInput;
  meta?: TripMeta;
}