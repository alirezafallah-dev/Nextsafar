import { NextRequest, NextResponse } from "next/server";

const WP =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

/* پروکسی دریافت وضعیت برنامه */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${WP}/nextsafar/v1/ai-trip-planner/plan/${id}`,
      {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      },
    );

    /* ✅ FIX: مدیریت پاسخ‌های غیر JSON */
    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: "pending",
          message: "سرور در حال پردازش است...",
        },
        { status: 200 },
      );
    }

    const out = NextResponse.json(data, { status: res.status });

    /* کوکی session مهمان را برگردان */
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) out.headers.set("set-cookie", setCookie);

    return out;
  } catch {
    return NextResponse.json(
      {
        status: "pending",
        message: "خطای موقت شبکه",
      },
      { status: 200 },
    );
  }
}