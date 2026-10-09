import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/config";

const WP_ROUTE = "/nextsafar/v1/account/hotel-favorites";

/** POST: ذخیره لیست علاقه‌مندی هتل در سرور */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.items || !Array.isArray(body.items)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const cookie = req.headers.get("cookie") ?? "";
    const r = await fetch(buildApiUrl(WP_ROUTE), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ items: body.items }),
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ ok: false, guest: true });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ ok: false, guest: true });
  }
}

/** GET: دریافت لیست از سرور */
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") ?? "";
    const r = await fetch(buildApiUrl(WP_ROUTE), {
      headers: { Cookie: cookie },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ ok: false, items: [] });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ ok: false, items: [] });
  }
}