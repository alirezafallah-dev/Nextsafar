import WorldMapExplorer from "./WorldMapExplorer";

export interface WorldNextTour {
  title: string;
  slug: string;
  departure_en: string;
  departure_fa: string;
  nights: number | null;
  transport: string | null;
  airline: string | null;
}

export interface WorldCity {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  banner: string | null;
  counts: Record<string, number>;
  next_tour: WorldNextTour | null;
}

export interface WorldCountry {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  banner: string | null;
  flag: string | null;
  cities: WorldCity[];
  totals: { dest: number; hotel: number; tour: number; other: number };
  score: number;
  visa: { title: string; slug: string } | null;
}

const WP_API_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

export default async function WorldMapSection() {
  let countries: WorldCountry[] = [];

  try {
    const res = await fetch(`${WP_API_URL}/nextsafar/v1/geo/world`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      countries = data?.countries ?? [];
    }
  } catch {
    countries = [];
  }

  if (!countries.length) return null;

  return (
    <section className="ns-container py-8 md:py-12">
      <WorldMapExplorer countries={countries} />
    </section>
  );
}
