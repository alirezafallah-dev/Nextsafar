import type { Metadata } from "next";
import { searchHotels, type HotelsSearchResult } from "@/lib/api/hotels";
import HotelSearchPageClient from "@/components/hotels/HotelSearchPageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const city = (Array.isArray(sp.city) ? sp.city[0] : sp.city) ?? "";

  return {
    title: city ? `هتل‌های ${city} | سفر بعدی` : "جستجوی هتل | سفر بعدی",
  };
}

export default async function HotelsSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const params = {
    city: first(sp.city) ?? "",
    checkIn: first(sp.checkIn) ?? "",
    checkOut: first(sp.checkOut) ?? "",
    adults: Number(first(sp.adults) ?? 2) || 2,
    children: Number(first(sp.children) ?? 0) || 0,
    rooms: Number(first(sp.rooms) ?? 1) || 1, // ✅ اضافه شد
  };

  const isResults = Boolean(params.city && params.checkIn && params.checkOut);

  let result: HotelsSearchResult | null = null;

  if (isResults) {
    result = await searchHotels({
      city: params.city,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      adults: params.adults,
      children: params.children,
    });
  }

  return (
    <HotelSearchPageClient
      params={params}
      result={result}
      isResults={isResults}
    />
  );
}