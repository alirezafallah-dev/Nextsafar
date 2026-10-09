/* ═══════════════════════════════════════════════════════════
   تایپ‌های سیستم نقشه (Leaflet + endpointهای geo وردپرس)
═══════════════════════════════════════════════════════════ */

export interface NearbyPlace {
  id: number;
  type: string;
  title: string;
  slug: string;
  url: string;
  lat: number;
  lng: number;
  image: string | null;
  stars: number;
  rating: number;
  location_type?: string;   /* ✅ جدید */
  distance_km: number;
  walking_min: number;
  driving_min: number;
}

export interface NearbyResponse {
  center: { lat: number; lng: number };
  radius_km: number;
  places: NearbyPlace[];
}

export interface TripEntity {
  type: string;
  slug: string;
  title: string;
  url: string;
  image: string | null;
  stars: number;
  rating: number;
  lat: number | null;
  lng: number | null;
  days?: number[];
  excerpt?: string;   /* ✅ جدید */
}
