"use client";

import { useEffect, useRef, useState } from "react";
import { loadLeaflet, waitForSize, scheduleFix } from "@/lib/map-loader";
import { getMapConfig } from "@/lib/api/map";
import { addTiles } from "@/components/map/map-icons";
import { compactToman, faDigits } from "@/lib/api/hotels";

export interface HotelMapPoint {
  key: string;
  lat: number;
  lng: number;
  title: string;
  price: number | null;
  isSite: boolean;
  href: string | null;
}

const C_SITE = "#0284c7";
const C_ONLINE = "#ffffff";
const C_ACTIVE = "#0b1e3a";

const MAP_CSS = `
.ns-map .leaflet-bar{border:none!important;box-shadow:none!important;}
.ns-map .leaflet-control-zoom{
  border:none!important;
  box-shadow:0 6px 20px rgba(15,23,42,.14)!important;
  border-radius:24px!important;
  overflow:hidden;
  background:#fff!important;
  margin:14px!important;
}
.ns-map .leaflet-control-zoom a{
  width:46px!important;height:46px!important;line-height:46px!important;
  background:transparent!important;color:#0f172a!important;
  font-size:21px!important;font-weight:600!important;border:none!important;
  transition:background .15s,color .15s;
}
.ns-map .leaflet-control-zoom a:first-child{border-bottom:1px solid #e5eaf1!important;}
.ns-map .leaflet-control-zoom a:hover{background:#f4f8fc!important;color:#0284c7!important;}
.ns-map .leaflet-control-zoom a.leaflet-disabled{opacity:.35!important;}
.ns-map .leaflet-control-attribution{font-size:9px!important;background:rgba(255,255,255,.7)!important;border-radius:6px 0 0 0;}
`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function pillHtml(p: HotelMapPoint, active: boolean): string {
  const label = p.price
    ? compactToman(p.price)
    : p.title.length > 14
      ? p.title.substring(0, 14) + "…"
      : p.title;
  const bg = active ? C_ACTIVE : p.isSite ? C_SITE : C_ONLINE;
  const fg = p.isSite || active ? "#fff" : "#0b1e3a";
  const border = p.isSite || active ? "none" : "1px solid #cbd5e1";
  return `
<div style="display:flex;flex-direction:column;align-items:center;width:110px;">
  <span style="background:${bg};color:${fg};border:${border};border-radius:999px;padding:4px 10px;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.28);white-space:nowrap;transform:scale(${active ? 1.15 : 1});transition:transform .15s;">${esc(label)}</span>
  <span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bg};"></span>
</div>`;
}

function popupHtml(p: HotelMapPoint): string {
  const price = p.price
    ? `<div style="color:#0284c7;font-weight:800;font-size:12px;margin-top:2px;">${faDigits(p.price.toLocaleString("en-US"))} تومان / شب</div>`
    : "";
  const link = p.href
    ? `<a href="${esc(p.href)}" ${p.isSite ? "" : 'target="_blank" rel="nofollow noopener"'} style="display:inline-block;margin-top:6px;color:#0284c7;font-weight:800;font-size:11px;">مشاهده هتل ←</a>`
    : "";
  return `<div style="direction:rtl;text-align:right;min-width:160px;font-size:12px;"><b>${esc(p.title)}</b>${price}${link}</div>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LLayer = any;

export default function HotelsMap({
  points,
  activeKey = null,
  height = 210,
  flyOnActive = false,
  refitSignal = 0,
  className = "",
  scrollWheelZoom = false,
}: {
  points: HotelMapPoint[];
  activeKey?: string | null;
  height?: number | string;
  flyOnActive?: boolean;
  refitSignal?: number;
  className?: string;
  scrollWheelZoom?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const LRef = useRef<LType>(null);
  const mapRef = useRef<LMap>(null);
  const layerRef = useRef<LLayer>(null);
  const markersRef = useRef<Map<string, LMap>>(new Map());
  const pointsRef = useRef<HotelMapPoint[]>(points);
  const [ready, setReady] = useState(false);

  // ✅ Update pointsRef in useEffect instead of render
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  /* ═══ ساخت نقشه (یک‌بار) ═══ */
  useEffect(() => {
    let cancelled = false;
    let cancelFix: (() => void) | null = null;

    (async () => {
      const [L, cfg] = await Promise.all([loadLeaflet(), getMapConfig()]);
      if (cancelled || !ref.current) return;
      await waitForSize(ref.current);
      if (cancelled || !ref.current) return;

      const pts = pointsRef.current.filter((p) => p.lat && p.lng);
      const center: [number, number] = pts.length
        ? [
            pts.reduce((s, p) => s + p.lat, 0) / pts.length,
            pts.reduce((s, p) => s + p.lng, 0) / pts.length,
          ]
        : [35.7, 51.4];

      const map = L.map(ref.current, {
        center,
        zoom: pts.length ? 12 : 5,
        attributionControl: true,
        scrollWheelZoom,
        zoomControl: true,
      });
      addTiles(L, map, cfg);

      LRef.current = L;
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      cancelFix = scheduleFix(map);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      cancelFix?.();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      
      markersRef.current = new Map();
      
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══ رندر مارکرها + فیت‌باوندز (بعد از آماده شدن نقشه) ═══ */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer || !ready) return;

    layer.clearLayers();
    markersRef.current.clear();

    const pts = points.filter((p) => p.lat && p.lng);
    pts.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: pillHtml(p, p.key === activeKey),
        iconSize: [110, 34],
        iconAnchor: [55, 34],
        popupAnchor: [0, -34],
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(layer);
      m.bindPopup(popupHtml(p), { closeButton: false });
      markersRef.current.set(p.key, m);
    });

    if (pts.length) {
      const b = L.latLngBounds(pts.map((p: HotelMapPoint) => [p.lat, p.lng]));
      map.fitBounds(b.pad(0.18), { maxZoom: 14, animate: true });
    }
  }, [points, ready, activeKey]);

  /* ═══ هایلایت / پرواز به مارکر فعال ═══ */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    markersRef.current.forEach((m, key) => {
      const p = pointsRef.current.find((x) => x.key === key);
      if (!p) return;
      m.setIcon(
        L.divIcon({
          className: "",
          html: pillHtml(p, key === activeKey),
          iconSize: [110, 34],
          iconAnchor: [55, 34],
          popupAnchor: [0, -34],
        }),
      );
      m.setZIndexOffset(key === activeKey ? 1000 : 0);
    });

    if (flyOnActive && activeKey) {
      const m = markersRef.current.get(activeKey);
      const p = pointsRef.current.find((x) => x.key === activeKey);
      if (m && p) {
        map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
        m.openPopup();
      }
    }
  }, [activeKey, ready, flyOnActive]);

  /* ═══ فیت مجدد (دکمه جستجوی نقشه) ═══ */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready || refitSignal === 0) return;
    const pts = pointsRef.current.filter((p) => p.lat && p.lng);
    if (pts.length) {
      const b = L.latLngBounds(pts.map((p: HotelMapPoint) => [p.lat, p.lng]));
      map.fitBounds(b.pad(0.18), { maxZoom: 14 });
    }
  }, [refitSignal, ready]);

  return (
    <>
      <style>{MAP_CSS}</style>
      <div
        ref={ref}
        className={`ns-map w-full relative z-0 bg-bg-sec ${className}`}
        style={{ height }}
        aria-label="نقشه هتل‌ها"
      />
    </>
  );
}