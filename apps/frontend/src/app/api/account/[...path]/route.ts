import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/config";
import { SESSION_COOKIE } from "@/lib/api/auth-config";

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, method: string, ctx: Ctx) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { path } = await ctx.params;
  const slug = (path ?? []).join("/");
  const qs = req.nextUrl.search;

  const ct = req.headers.get("content-type") || "";
  const headers: Record<string, string> = { "x-ns-session": token };
  let body: BodyInit | undefined;

  if (method !== "GET") {
    if (ct.includes("multipart/form-data")) {
      body = await req.formData(); // آپلود آواتار
    } else {
      const text = await req.text();
      if (text) {
        body = text;
        headers["Content-Type"] = "application/json";
      }
    }
  }

  const res = await fetch(buildApiUrl(`/nextsafar/v1/account/${slug}${qs}`), {
    method,
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export const GET = (r: NextRequest, c: Ctx) => proxy(r, "GET", c);
export const POST = (r: NextRequest, c: Ctx) => proxy(r, "POST", c);
export const DELETE = (r: NextRequest, c: Ctx) => proxy(r, "DELETE", c);