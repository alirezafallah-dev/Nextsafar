import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/config";

/* ═══ BFF: اعتبارسنجی + فوروارد به وردپرس (WP_URL لو نمی‌ره) ═══ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contact = String(body?.contact ?? "").trim();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isMobile = /^(\+98|98|0)?9\d{9}$/.test(contact.replace(/[\s-]/g, ""));

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { ok: false, message: "ایمیل یا شماره موبایل معتبر وارد کن." },
        { status: 422 },
      );
    }

    const res = await fetch(buildApiUrl("nextsafar/v1/leads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact,
        type: isEmail ? "email" : "mobile",
        source: "home-price-alert",
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("WP error");
    const data = await res.json();
    return NextResponse.json({ ok: true, duplicate: !!data.duplicate });
  } catch {
    return NextResponse.json(
      { ok: false, message: "خطا در ارتباط با سرور؛ دوباره تلاش کن." },
      { status: 500 },
    );
  }
}