import type { TripInput, TripPlan } from "@/types/ai-trip";

/** پاسخ اولیه ساخت برنامه */
export interface GenerateResponse {
  success: boolean;
  plan_id: number;
  status: "pending" | "completed";
  message?: string;
  cached?: boolean;
  plan?: TripPlan;
  remaining_today?: number;
}

/** شهر برای اتوکامپلیت مقصد */
export interface CityItem {
  city: string;
  country: string;
}

/* ═══════════════════════════════════════════════════════
   ✅ FIX: پارس ایمن پاسخ سرور — برگشت `unknown`
   این باعث می‌شود بعداً بتوان به هر تایپی بدون خطا تبدیل کرد
═══════════════════════════════════════════════════════ */
async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("سرور پاسخ نامعتبر داد. لطفاً دوباره تلاش کنید.");
  }
}

/** استخراج پیام خطا از پاسخ سرور */
function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as Record<string, unknown>).message;
    return typeof msg === "string" && msg ? msg : fallback;
  }
  return fallback;
}

/**
 * ساخت برنامه سفر جدید
 */
export async function generateTripPlan(
  input: TripInput
): Promise<GenerateResponse> {
  const res = await fetch("/api/ai-trip/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(extractMessage(data, "خطایی رخ داد. دوباره تلاش کن."));
  }

  /* ✅ `unknown` به راحتی به هر تایپی تبدیل می‌شود */
  return data as GenerateResponse;
}

/**
 * دریافت وضعیت برنامه (برای پولینگ)
 */
export async function getTripPlanStatus(planId: number): Promise<TripPlan> {
  const res = await fetch(`/api/ai-trip/plan/${planId}`, {
    cache: "no-store",
    credentials: "include", /* ✅ ارسال کوکی session */
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(extractMessage(data, "خطا در دریافت وضعیت برنامه"));
  }

  return data as TripPlan;
}

/**
 * دریافت لیست شهرها برای اتوکامپلیت مقصد
 */
export async function getDestinations(): Promise<CityItem[]> {
  try {
    const res = await fetch("/api/ai-trip/destinations");
    if (!res.ok) return [];

    const data = await parseResponse(res);

    if (typeof data === "object" && data !== null && "items" in data) {
      const items = (data as Record<string, unknown>).items;
      return Array.isArray(items) ? (items as CityItem[]) : [];
    }
    return [];
  } catch {
    return [];
  }
}