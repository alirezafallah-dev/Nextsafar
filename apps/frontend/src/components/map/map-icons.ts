/* ═══════════════════════════════════════════════════════════
   سیستم آیکون و کاشی نقشه — نسخه ۲.۰ (یکپارچه با کانفیگ بک‌اند)
═══════════════════════════════════════════════════════════ */

import type { MapTileConfig } from "@/lib/api/map";

/* ═══ نام‌های فارسی ═══ */
export const TYPE_FA: Record<string, string> = {
  hotel: "هتل",
  destination: "جاذبه",
  restaurant: "رستوران",
  airport: "فرودگاه",
  hospital: "بیمارستان",
  travelguide: "راهنما",
};

/* ═══ رنگ‌ها ═══ */
export const TYPE_COLORS: Record<string, string> = {
  hotel: "#43ABFF",
  destination: "#9B59B6",
  restaurant: "#e67e22",
  airport: "#27AE60",
  hospital: "#e74c3c",
  center: "#0b1e3a",
};

export function colorOf(type: string): string {
  return TYPE_COLORS[type] ?? "#64748b";
}

/* ═══ نرمال‌سازی locationType (فارسی/انگلیسی) ═══ */
const LOCATION_TYPE_MAP: Record<string, string> = {
  "تاریخی": "historical", "فرهنگی": "cultural", "طبیعی": "natural",
  "ساحلی": "beach_recreational", "شهری": "urban", "مذهبی": "religious",
  "آکواریوم": "aquarium_zoo", "باغ": "parks_gardens", "ماجراجویی": "adventure",
  "غذا": "gastronomy", "جشنواره": "events_festivals", "سنتی": "traditional",
  "فست‌فود": "fast_food", "کافه": "cafe", "قهوه‌خانه": "coffee_shop",
  "کافی‌شاپ": "coffee_shop", "رستوران‌کافه": "coffe_restaurant",
  "خیابانی": "street_food", "نانوایی": "bakery", "بار": "bar",
};

export function normalizeLocationType(raw: string | null | undefined): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (LOCATION_TYPE_MAP[s]) return LOCATION_TYPE_MAP[s];
  return s.toLowerCase().replace(/\s+/g, "_");
}

/* ═══════════════════════════════════════════════════════════
   آیکون‌های SVG داخلی (برای destination و restaurant)
═══════════════════════════════════════════════════════════ */
export function getIconSVG(type: string, locationType = ""): string {
  const lt = normalizeLocationType(locationType);

  if (type === "destination") {
    switch (lt) {
      case "historical":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><path d="M2.43,13.89c1.92-1,3.83-1.91,3.83-3.82H17.74c0,1.91,1.91,2.86,3.83,3.82"/><polyline points="1.48 13.89 2.44 13.89 21.57 13.89 22.52 13.89"/><path d="M5.3,6.24c1.92-1,3.83-1.91,3.83-3.83h5.74c0,1.92,1.91,2.87,3.83,3.83"/><rect x="2.43" y="17.72" width="19.13" height="4.78"/></svg>`;
      case "cultural":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><rect x="1.5" y="5.32" width="21" height="16.23"/><circle cx="13.91" cy="13.91" r="4.77"/></svg>`;
      case "natural":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><line x1="1.09" y1="22" x2="22.91" y2="22"/><path d="M1.55,12.45,4.08,9.92a2.19,2.19,0,0,1,1.56-.65h0a2.16,2.16,0,0,1,1.55.65L19.27,22"/><circle cx="12.45" cy="4.27" r="2.27"/></svg>`;
      case "beach_recreational":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><line x1="0.5" y1="22.55" x2="23.5" y2="22.55"/><line x1="8.22" y1="8.47" x2="3.04" y2="22.73"/></svg>`;
      case "religious":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="22" fill="none" stroke="currentColor"><polygon points="16.77 22.48 7.23 22.48 7.23 9.11 12 5.29 16.77 9.11 16.77 22.48"/><line x1="12" y1="0.52" x2="12" y2="5.3"/></svg>`;
      default:
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><polygon points="17.73 6.27 15.82 2.46 8.18 2.46 6.27 6.27 1.5 6.27 1.5 21.55 22.5 21.55 22.5 6.27 17.73 6.27"/><circle cx="12" cy="12.95" r="4.77"/></svg>`;
    }
  }

  if (type === "restaurant") {
    switch (lt) {
      case "cafe":
      case "coffee_shop":
      case "coffe_restaurant":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><path d="M1.69,4.5h15V16.69a2.81,2.81,0,0,1-2.81,2.81H4.5a2.81,2.81,0,0,1-2.81-2.81V4.5Z"/><rect x="16.69" y="7.31" width="5.62" height="8.44" rx="2.81"/></svg>`;
      case "fast_food":
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><path d="M22.5,14.5,3.7,22.38a1.58,1.58,0,0,1-.61.12h0A1.59,1.59,0,0,1,1.5,20.91h0a1.58,1.58,0,0,1,.12-.61L9.5,1.5a13,13,0,0,1,13,13Z"/></svg>`;
      default:
        return `<svg style="color:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.3" width="22" height="20" fill="none" stroke="currentColor"><path d="M11,.5V6.76a3.81,3.81,0,0,1-2.12,3.42h0a3.83,3.83,0,0,1-3.43,0h0A3.83,3.83,0,0,1,3.37,6.76V.5"/><line x1="7.21" y1="0.5" x2="7.21" y2="23.5"/></svg>`;
    }
  }

  switch (type) {
    case "hotel":
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" d="M18 17v2M12 5.5V10m-6 7v2m15-2v-4c0-1.6569-1.3431-3-3-3H6c-1.65685 0-3 1.3431-3 3v4h18Zm-2-7V8c0-1.65685-1.3431-3-3-3H8C6.34315 5 5 6.34315 5 8v2h14Z"/></svg>`;
    case "hospital":
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M8.5 5.034v1.1l.953-.55.5.867L9 7l.953.55-.5.866-.953-.55v1.1h-1v-1.1l-.953.55-.5-.866L7 7l-.953-.55.5-.866.953.55v-1.1zM5 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1z"/></svg>`;
    case "airport":
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849"/></svg>`;
    case "travelguide":
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M7 1.414V2H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h5v1H2.5a1 1 0 0 0-.8.4L.725 8.7a.5.5 0 0 0 0 .6l.975 1.3a1 1 0 0 0 .8.4H7v5h2v-5h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H9V6h4.5a1 1 0 0 0 .8-.4l.975-1.3a.5.5 0 0 0 0-.6L14.3 2.4a1 1 0 0 0-.8-.4H9v-.586a1 1 0 0 0-2 0"/></svg>`;
    case "center":
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94z"/><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`;
    default:
      return `<svg style="color:#fff;" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0a5 5 0 0 0-5 5c0 2.837 2.254 5.902 5 8.944 2.746-3.042 5-6.107 5-8.944a5 5 0 0 0-5-5z"/><circle cx="8" cy="5" r="2"/></svg>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   قطره‌ای با SVG داخلی (برای NearbyMap)
═══════════════════════════════════════════════════════════ */
export function createMarkerSVG(color: string, iconSVG: string, size = 35): string {
  const width = size;
  const height = size + 7;
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="1" width="${width}" height="${size}" rx="5" ry="5" fill="${color}"/>
      <polygon points="${width / 2 - 7},${size} ${width / 2 + 7},${size} ${width / 2},${height}" fill="${color}"/>
      <foreignObject x="5" y="6" width="${width - 10}" height="${size - 10}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
          ${iconSVG}
        </div>
      </foreignObject>
    </svg>
  `;
}

/* ═══ Marker با آیکون تخصصی (قطره‌ای) ═══ */
export function makeMarkerIcon(L: any, color: string, type: string, locationType = "") {
  const iconSVG = getIconSVG(type, locationType);
  return L.divIcon({
    className: "ns-marker-drop",
    html: `<div style="width:30px;height:38px;">${createMarkerSVG(color, iconSVG)}</div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38],
  });
}

/* ═══ تبدیل عدد به فارسی ═══ */
export function faNum(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/* ═══ مارکر مربعی شماره‌دار (برای TripMapPanel) ═══ */
export function makeNumberedMarker(L: any, color: string, number: number) {
  const size = 34;
  const tail = 9;
  const height = size + tail;
  const svg = `<svg width="${size}" height="${height}" viewBox="0 0 ${size} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${size}" height="${size}" rx="7" ry="7" fill="${color}"/>
    <polygon points="${size / 2 - 7},${size - 1} ${size / 2 + 7},${size - 1} ${size / 2},${height}" fill="${color}"/>
    <text x="${size / 2}" y="${size / 2 + 5.5}" font-size="15" font-weight="800" text-anchor="middle" fill="#ffffff">${faNum(number)}</text>
  </svg>`;
  return L.divIcon({
    className: "ns-marker-numbered",
    html: svg,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height],
  });
}

/* ═══════════════════════════════════════════════════════════
   ✅ کاشی‌ها از کانفیگ بک‌اند (نه از env فرانت!)
   امضای سه‌آرگومانی — cfg اجباری است
═══════════════════════════════════════════════════════════ */
export function addTiles(L: any, map: any, cfg: MapTileConfig): any {
  const fallbackUrl = cfg?.fallback_url ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = cfg?.attribution ?? "© OpenStreetMap contributors";
  const maxZoom = cfg?.max_zoom ?? 19;

  const makeLayer = (url: string, attr: string) =>
    L.tileLayer(url, { maxZoom, attribution: attr, keepBuffer: 4 });

  const tileUrl = cfg?.tile_url;
  if (!tileUrl || tileUrl === fallbackUrl) {
    const l = makeLayer(tileUrl || fallbackUrl, attribution);
    l.addTo(map);
    return l;
  }

  const layer = makeLayer(tileUrl, attribution);
  let switched = false;
  layer.on("tileerror", () => {
    if (switched) return;
    switched = true;
    try { map.removeLayer(layer); } catch {}
    makeLayer(fallbackUrl, "© OpenStreetMap contributors").addTo(map);
  });
  layer.addTo(map);
  return layer;
}