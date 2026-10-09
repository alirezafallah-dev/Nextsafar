import { NextRequest, NextResponse } from "next/server";

const WP = process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${WP}/nextsafar/v1/ai-trip-planner/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    const out = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) out.headers.set("set-cookie", setCookie);
    return out;
  } catch {
    return NextResponse.json({ message: "خطا در ارتباط با سرور" }, { status: 500 });
  }
}