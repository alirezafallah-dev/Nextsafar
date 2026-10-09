/* ═══════════════════════════════════════════════════════
   NextSafar — Assistant Chat API Client
   ارسال پیام به دستیار هوشمند سفر
═══════════════════════════════════════════════════════ */

/* ═══ آیتم تاریخچه گفتگو ═══ */
export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

/* ═══ موجودیت‌های یک برنامه (هتل، رستوران، جاذبه) ═══ */
export interface PlanEntity {
  type: string;
  slug: string;
  title: string;
  url: string;
  image?: string | null;
  stars?: number;
  rating?: number;
  lat?: number | null;
  lng?: number | null;
  days?: number[];
  excerpt?: string;
}

/* ═══ ورودی ساخت برنامه سفر ═══ */
export interface TripInput {
  destination: string;
  country?: string;
  days: number;
  travelers?: number;
  budget_level?: "economy" | "medium" | "luxury";
  interests?: string[];
  start_date?: string | null;
}

/* ═══ پاسخ چت دستیار ═══ */
export interface AssistantChatResponse {
  type: "answer" | "plan" | string;
  text: string;
  suggestions?: string[];
  entities?: PlanEntity[];
  panel_title?: string;
  plan_id?: number;
  input?: TripInput;
  cached?: boolean;
}

/* ═══════════════════════════════════════════════════════
   پارس ایمن پاسخ سرور — برگشت `unknown`
═══════════════════════════════════════════════════════ */
async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("سرور پاسخ نامعتبر داد. لطفاً دوباره تلاش کنید.");
  }
}

/* استخراج پیام خطا از پاسخ سرور */
function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as Record<string, unknown>).message;
    return typeof msg === "string" && msg ? msg : fallback;
  }
  return fallback;
}

/* ═══════════════════════════════════════════════════════
   ✅ ارسال پیام به دستیار هوشمند سفر
═══════════════════════════════════════════════════════ */
export async function sendChatMessage(
  message: string,
  history: ChatHistoryEntry[] = []
): Promise<AssistantChatResponse> {
  const res = await fetch("/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(
      extractMessage(data, "خطا در ارتباط با دستیار. دوباره تلاش کن.")
    );
  }

  return data as AssistantChatResponse;
}