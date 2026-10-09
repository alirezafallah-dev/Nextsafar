/* ================================================================
لایه جستجوی آنلاین — Adapter Pattern (نسخه واقعی)

✅ ویژگی‌ها:
- اتصال به بک‌اند WordPress از طریق REST API
- پشتیبانی از SerpApi و SearchApi (از طریق بک‌اند)
- کش‌گذاری و revalidation
================================================================ */

import { buildApiUrl } from "../api/config";

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface FlightQuery {
    tripType: "one" | "round";
    origin: string;        // نام شهر فارسی
    originCode: string;    // کد IATA فرودگاه
    destination: string;   // نام شهر فارسی
    destCode: string;      // کد IATA فرودگاه
    departDate: string;    // YYYY/MM/DD جلالی
    returnDate?: string;   // YYYY/MM/DD جلالی
    cabin?: string;        // economy, business, first
    adults: number;
    children: number;
}

export interface HotelQuery {
    city: string;          // نام شهر
    cityEn?: string;       // نام شهر به انگلیسی (اختیاری)
    checkIn: string;       // YYYY-MM-DD میلادی
    checkOut: string;      // YYYY-MM-DD میلادی
    adults: number;
    children: number;
}

export interface FlightResult {
    id: number;
    flight_number: string;
    airline: string;
    airline_logo: string | null;
    origin_code: string;
    origin_city: string;
    dest_code: string;
    dest_city: string;
    date: string;
    depart_time: string;
    arrive_time: string;
    next_day: boolean;
    duration_min: number;
    stops: number;
    price: number;         // تومان
    currency: string;
    cabin: string;
    aircraft: string;
}

export interface HotelResult {
    property_id: string;
    name: string;
    link: string;
    image: string | null;
    rating: number;
    reviews: number;
    address: string;
    lat: number | null;
    lng: number | null;
    price_usd: number;
    per_night_toman: number;
}

// ═══════════════════════════════════════════════════════
// API Response Types
// ═══════════════════════════════════════════════════════

interface ApiResponse<T> {
    ok: boolean;
    items: T[];
    from_cache: boolean;
    provider?: string;
    error?: string;
}

// ═══════════════════════════════════════════════════════
// Flight Provider (Real API)
// ═══════════════════════════════════════════════════════

export interface FlightProvider {
    search(q: FlightQuery): Promise<FlightResult[]>;
}

class RealFlightProvider implements FlightProvider {
    async search(q: FlightQuery): Promise<FlightResult[]> {
        const params = new URLSearchParams({
            origin: q.origin,
            originCode: q.originCode,
            destination: q.destination,
            destCode: q.destCode,
            date: q.departDate,
            tripType: q.tripType,
            cabin: q.cabin ?? "economy",
            adults: String(q.adults),
            children: String(q.children),
        });

        if (q.returnDate) {
            params.set("returnDate", q.returnDate);
        }

        try {
            const res = await fetch(
                buildApiUrl(`/nextsafar/v1/flights/search?${params.toString()}`),
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    },
                    next: { revalidate: 300 }, // کش 5 دقیقه
                }
            );

            if (!res.ok) {
                console.error("Flight search failed:", res.status, res.statusText);
                return [];
            }

            const data: ApiResponse<FlightResult> = await res.json();

            if (!data.ok) {
                console.error("Flight search error:", data.error);
                return [];
            }

            console.log(`✅ Found ${data.items.length} flights (from_cache: ${data.from_cache}, provider: ${data.provider ?? "unknown"})`);
            return data.items;

        } catch (err) {
            console.error("Flight search exception:", err);
            return [];
        }
    }
}

// ═══════════════════════════════════════════════════════
// Hotel Provider (Real API)
// ═══════════════════════════════════════════════════════

export interface HotelProvider {
    search(q: HotelQuery): Promise<HotelResult[]>;
}

class RealHotelProvider implements HotelProvider {
    async search(q: HotelQuery): Promise<HotelResult[]> {
        const params = new URLSearchParams({
            city: q.city,
            check_in: q.checkIn,
            check_out: q.checkOut,
            adults: String(q.adults),
            children: String(q.children),
        });

        if (q.cityEn) {
            params.set("q_en", q.cityEn);
        }

        try {
            const res = await fetch(
                buildApiUrl(`/nextsafar/v1/hotels/search?${params.toString()}`),
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    },
                    next: { revalidate: 300 }, // کش 5 دقیقه
                }
            );

            if (!res.ok) {
                console.error("Hotel search failed:", res.status, res.statusText);
                return [];
            }

            const data: ApiResponse<HotelResult> = await res.json();

            if (!data.ok) {
                console.error("Hotel search error:", data.error);
                return [];
            }

            console.log(`✅ Found ${data.items.length} hotels (from_cache: ${data.from_cache}, provider: ${data.provider ?? "unknown"})`);
            return data.items;

        } catch (err) {
            console.error("Hotel search exception:", err);
            return [];
        }
    }
}

// ═══════════════════════════════════════════════════════
// Export Providers (Singleton)
// ═══════════════════════════════════════════════════════

export const flightProvider: FlightProvider = new RealFlightProvider();
export const hotelProvider: HotelProvider = new RealHotelProvider();

// ═══════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════

export const searchFlights = (q: FlightQuery) => flightProvider.search(q);
export const searchHotels = (q: HotelQuery) => hotelProvider.search(q);

/** تور = پرواز + بررسی موجودی هتل */
export async function searchTours(q: FlightQuery) {
    const [flights, hotels] = await Promise.all([
        flightProvider.search(q),
        hotelProvider.search({
            city: q.destination,
            cityEn: q.destCode,
            checkIn: q.departDate,
            checkOut: q.returnDate || q.departDate,
            adults: q.adults,
            children: q.children,
        }),
    ]);

    return { flights, hotels };
}

// ═══════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════

export function validateFlightQuery(q: FlightQuery): string[] {
    const e: string[] = [];

    if (!q.origin.trim()) e.push("مبدا الزامی است");
    if (!q.originCode.trim()) e.push("کد فرودگاه مبدا الزامی است");
    if (!q.destination.trim()) e.push("مقصد الزامی است");
    if (!q.destCode.trim()) e.push("کد فرودگاه مقصد الزامی است");
    
    if (q.originCode && q.originCode === q.destCode)
        e.push("مبدا و مقصد نمی‌توانند یکسان باشند");
    
    if (!q.departDate) e.push("تاریخ رفت الزامی است");
    
    if (q.tripType === "round" && !q.returnDate) 
        e.push("تاریخ برگشت الزامی است");
    
    if (q.tripType === "round" && q.returnDate && q.returnDate < q.departDate)
        e.push("تاریخ برگشت قبل از رفت است");
    
    if (q.adults < 1) e.push("حداقل یک بزرگسال الزامی است");
    
    return e;
}

export function validateHotelQuery(q: HotelQuery): string[] {
    const e: string[] = [];

    if (!q.city.trim()) e.push("شهر مقصد الزامی است");
    if (!q.checkIn) e.push("تاریخ ورود الزامی است");
    if (!q.checkOut) e.push("تاریخ خروج الزامی است");
    
    if (q.checkIn && q.checkOut && q.checkOut <= q.checkIn)
        e.push("تاریخ خروج باید بعد از ورود باشد");
    
    if (q.adults < 1) e.push("حداقل یک بزرگسال الزامی است");
    
    return e;
}

// ═══════════════════════════════════════════════════════
// Formatters
// ═══════════════════════════════════════════════════════

export const formatToman = (n: number) => `${n.toLocaleString("fa-IR")} تومان`;

export const formatDuration = (m: number) =>
    `${Math.floor(m / 60)}س ${m % 60}د`;

export const formatPrice = (n: number) => {
    if (n >= 1_000_000_000) {
        return `${(n / 1_000_000_000).toFixed(1)} میلیارد تومان`;
    }
    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1)} میلیون تومان`;
    }
    return formatToman(n);
};