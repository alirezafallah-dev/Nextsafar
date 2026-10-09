import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api/config";
import { WP_AUTH_BASE } from "@/lib/api/auth-config";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const res = await fetch(buildApiUrl(`${WP_AUTH_BASE}/send-otp`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}