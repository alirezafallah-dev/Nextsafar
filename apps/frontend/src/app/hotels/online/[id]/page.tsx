import type { Metadata } from "next";
import { buildApiUrl } from "@/lib/api/config";
import type { OnlineHotelDetails } from "@/lib/api/hotels";
import OnlineHotelPageClient from "@/components/hotels/OnlineHotelPageClient";

export const metadata: Metadata = {
  title: "جزئیات هتل | سفر بعدی",
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

async function getDetails(
  token: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  name?: string,  // ✅ اضافه شد
): Promise<OnlineHotelDetails | null> {
  try {
    const url = new URL(buildApiUrl("/nextsafar/v1/hotels/details"));
    url.searchParams.set("token", token);
    url.searchParams.set("check_in", checkIn);
    url.searchParams.set("check_out", checkOut);
    url.searchParams.set("adults", String(adults));
    if (name) url.searchParams.set("name", name);  // ✅ اضافه شد
    
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? (data.hotel as OnlineHotelDetails) : null;
  } catch {
    return null;
  }
}

export default async function OnlineHotelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = first(sp.token) ?? "";
  const name = first(sp.name) ?? "";
  const city = first(sp.city) ?? "";
  const checkIn = first(sp.checkIn) ?? "";
  const checkOut = first(sp.checkOut) ?? "";
  const adults = Number(first(sp.adults) ?? 2) || 2;

  const hotel = token
    ? await getDetails(token, checkIn, checkOut, adults, name)  // ✅ name اضافه شد
    : null;

  return (
    <OnlineHotelPageClient
      hotel={hotel}
      fallbackName={name}
      city={city}
      checkIn={checkIn}
      checkOut={checkOut}
      adults={adults}
    />
  );
}