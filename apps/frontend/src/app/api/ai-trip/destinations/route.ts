import { NextResponse } from "next/server";

const WP =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

export const revalidate = 3600;

/* لیست شهرها برای اتوکامپلیت مقصد */
export async function GET() {
  try {
    const res = await fetch(`${WP}/nextsafar/v1/geo/world`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ items: [] });

    const data = await res.json();
    const items: { city: string; country: string }[] = [];

    for (const c of data.countries || []) {
      for (const city of c.cities || []) {
        items.push({ city: city.name, country: c.name });
      }
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
