import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { buildApiUrl } from "@/lib/api/config";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  WP_AUTH_BASE,
} from "@/lib/api/auth-config";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/* محافظت در برابر open redirect */
function toAbsoluteUrl(returnUrl: string | undefined, base: string): string {
  const fallback = `${base}/`;
  if (!returnUrl) return fallback;
  try {
    const parsed = new URL(returnUrl, base);
    const baseParsed = new URL(base);
    if (parsed.hostname === baseParsed.hostname) {
      return parsed.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const cookieStore = await cookies();

  const savedState = cookieStore.get("google_oauth_state")?.value;
  const returnUrl = cookieStore.get("google_oauth_return")?.value || "/";
  const queryState = req.nextUrl.searchParams.get("state");
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  console.log("[google callback]", {
    hasSavedState: !!savedState,
    queryState,
    hasCode: !!code,
    error,
    returnUrl,
  });

  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${frontendUrl}/account?auth_error=${reason}`);

  if (error || !code || !queryState) {
    console.error("[google callback] Missing params");
    return failRedirect("cancelled");
  }

  if (!savedState || savedState !== queryState) {
    console.error("[google callback] State mismatch");
    return failRedirect("state_mismatch");
  }

  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: `${frontendUrl}/api/auth/google/callback`,
    });

    if (!tokens.id_token) return failRedirect("no_token");

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return failRedirect("invalid_payload");

    console.log("[google callback] Verified user", {
      email: payload.email,
      name: payload.name,
    });

    const wpRes = await fetch(
      buildApiUrl(`${WP_AUTH_BASE}/google/resolve-user`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ns-secret": process.env.NS_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          email: payload.email,
          name: payload.name || payload.email.split("@")[0],
          avatar: payload.picture || null,
        }),
      }
    );

    const wpData = await wpRes.json();
    if (!wpData.ok || !wpData.session_token) {
      console.error("[google callback] WP error", wpData);
      return failRedirect("wp_error");
    }

    console.log("[google callback] WP success", {
      userId: wpData.user?.id,
      isNew: wpData.is_new,
    });

    /* ✅ FIX: ست کردن کوکی روی cookieStore (نه response) قبل از redirect */
    cookieStore.set({
      name: SESSION_COOKIE,
      value: wpData.session_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // پاک کردن کوکی‌های OAuth
    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_oauth_return");

    const safeReturn = toAbsoluteUrl(returnUrl, frontendUrl);
    console.log("[google callback] Redirecting to", safeReturn);

    return NextResponse.redirect(safeReturn);
  } catch (err) {
    console.error("[google callback] Exception", err);
    return failRedirect("exception");
  }
}