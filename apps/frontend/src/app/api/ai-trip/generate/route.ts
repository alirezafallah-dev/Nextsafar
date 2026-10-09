import { NextRequest, NextResponse } from "next/server";

const WP =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

/* پروکسی ساخت برنامه — با مدیریت کامل خطاها */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${WP}/nextsafar/v1/ai-trip-planner/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    /* ✅ FIX: مدیریت پاسخ‌های غیر JSON (مثلاً خطای PHP) */
    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "سرور پاسخ نامعتبر داد. لطفاً چند دقیقه بعد دوباره تلاش کنید.",
        },
        { status: 502 },
      );
    }

    const out = NextResponse.json(data, { status: res.status });

    /* کوکی session مهمان رو به مرورگر منتقل کن */
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) out.headers.set("set-cookie", setCookie);

    return out;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید.",
      },
      { status: 500 },
    );
  }
}