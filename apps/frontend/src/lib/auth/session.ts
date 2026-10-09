import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/config";
import { WP_AUTH_BASE, SESSION_COOKIE } from "@/lib/api/auth-config";

export interface AuthUser {
  id: number;
  display_name: string;
  phone: string;
  email: string | null;
  avatar: string;
}

/* ═══ خواندن کاربر نشست از سمت سرور ═══ */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const store = await cookies(); // ✅ در Next 16 حتماً await
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const res = await fetch(buildApiUrl(`${WP_AUTH_BASE}/me`), {
      headers: { "x-ns-session": token },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.ok ? (data.user as AuthUser) : null;
  } catch (e) {
    console.error("[getSessionUser]", e);
    return null;
  }
}