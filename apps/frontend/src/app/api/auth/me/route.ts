import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/config";
import { WP_AUTH_BASE, SESSION_COOKIE } from "@/lib/api/auth-config";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ await
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "no_session" }, { status: 401 });
    }
    
    const res = await fetch(buildApiUrl(`${WP_AUTH_BASE}/me`), {
      headers: { "x-ns-session": token },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[/api/auth/me]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}