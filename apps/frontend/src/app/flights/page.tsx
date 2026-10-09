import type { Metadata } from "next";
import { searchFlights, type FlightResult } from "@/lib/api/flights";
import FlightSearchPageClient from "@/components/flights/FlightSearchPageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const o = first(sp.origin);
  const d = first(sp.destination);
  return {
    title:
      o && d ? `پرواز ${o} به ${d} | سفر بعدی` : "جستجوی پرواز | سفر بعدی",
  };
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const params = {
    origin: first(sp.origin) ?? "",
    originCode: first(sp.originCode) ?? "",
    destination: first(sp.destination) ?? "",
    destCode: first(sp.destCode) ?? "",
    departDate: first(sp.departDate) ?? "",
    returnDate: first(sp.returnDate) ?? "",
    tripType: (first(sp.tripType) === "round" ? "round" : "one") as
      | "one"
      | "round",
    cabin: first(sp.cabin) ?? "economy",
    adults: Number(first(sp.adults) ?? 1) || 1,
    children: Number(first(sp.children) ?? 0) || 0,
  };

  const isResults = Boolean(
    params.originCode && params.destCode && params.departDate
  );

  let outbound: FlightResult[] = [];
  let inbound: FlightResult[] = [];

  if (isResults) {
    console.log("[FlightsPage] Searching outbound flights:", {
      originCode: params.originCode,
      destCode: params.destCode,
      date: params.departDate,
    });

    outbound = await searchFlights({
      origin: params.origin,
      originCode: params.originCode,
      destination: params.destination,
      destCode: params.destCode,
      date: params.departDate,
      tripType: params.tripType,
      cabin: params.cabin,
      adults: params.adults,
      children: params.children,
    });

    // جستجوی پرواز برگشت (فقط برای round trip)
    if (params.tripType === "round" && params.returnDate) {
      console.log("[FlightsPage] Searching inbound flights:", {
        originCode: params.destCode,
        destCode: params.originCode,
        date: params.returnDate,
      });

      inbound = await searchFlights({
        origin: params.destination,
        originCode: params.destCode,
        destination: params.origin,
        destCode: params.originCode,
        date: params.returnDate,
        tripType: params.tripType,
        cabin: params.cabin,
        adults: params.adults,
        children: params.children,
      });
    }
  }

  return (
    <FlightSearchPageClient
      params={params}
      outbound={outbound}
      inbound={inbound}
      isResults={isResults}
    />
  );
}