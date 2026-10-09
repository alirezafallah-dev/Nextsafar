import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "google_not_configured" },
      { status: 500 }
    );
  }

  const state =
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  const nextParam = req.nextUrl.searchParams.get("next");
  const referer = req.headers.get("referer");
  const returnUrl = nextParam || referer || `${frontendUrl}/`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${frontendUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  const cookieStore = await cookies();

  /* ✅ ست کوکی‌های state روی cookieStore */
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  cookieStore.set("google_oauth_return", returnUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(
    `${GOOGLE_AUTH_URL}?${params.toString()}`
  );
}