import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/config";
import { WP_AUTH_BASE, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/api/auth-config";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    const cookieStore = await cookies();

    const res = await fetch(buildApiUrl(`${WP_AUTH_BASE}/verify-otp`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();

    if (!data.ok || !data.session_token) {
      return NextResponse.json(data, { status: res.status });
    }

    /* ✅ ست کوکی روی cookieStore (مستقیم) */
    cookieStore.set({
      name: SESSION_COOKIE,
      value: data.session_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({
      ok: true,
      user: data.user,
    });
  } catch (e) {
    console.error("[verify-otp]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}