import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/config";
import { WP_AUTH_BASE, SESSION_COOKIE } from "@/lib/api/auth-config";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      try {
        await fetch(buildApiUrl(`${WP_AUTH_BASE}/logout`), {
          method: "POST",
          headers: { "x-ns-session": token },
        });
      } catch {}
    }

    /* ✅ حذف کوکی از cookieStore */
    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[logout]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}