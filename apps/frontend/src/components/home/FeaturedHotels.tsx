import FeaturedHotelsClient, { FeaturedHotel } from "./FeaturedHotelsClient";
import { buildApiUrl } from "@/lib/api/config";

export default async function FeaturedHotels() {
  let hotels: FeaturedHotel[] = [];
  
  try {
    const res = await fetch(
      buildApiUrl("nextsafar/v1/featured-hotels"),
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      hotels = await res.json();
    }
  } catch {
    hotels = [];
  }

  if (hotels.length === 0) return null;

  return <FeaturedHotelsClient hotels={hotels} />;
}