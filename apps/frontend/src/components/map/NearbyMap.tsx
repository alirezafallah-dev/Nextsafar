"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X, Footprints, Car } from "lucide-react";
import type { NearbyPlace } from "@/types/map";
import { loadLeaflet, waitForSize } from "@/lib/map-loader";
import { getMapConfig } from "@/lib/api/map";
import { addTiles, colorOf, makeMarkerIcon, TYPE_FA } from "./map-icons";

interface NearbyMapProps {
  center: { lat: number; lng: number };
  places: NearbyPlace[];
  height?: number;
}

export default function NearbyMap({ center, places, height = 260 }: NearbyMapProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fullMapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  /* ═══ پیش‌نمایش ═══ */
  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      const [L, cfg] = await Promise.all([loadLeaflet(), getMapConfig()]);
      if (cancelled || !previewRef.current) return;
      await waitForSize(previewRef.current);
      if (cancelled || !previewRef.current) return;

      map = L.map(previewRef.current, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false,
      });
      addTiles(L, map, cfg);

      /* مرکز با آیکون قطره‌ای */
      L.marker([center.lat, center.lng], {
        icon: makeMarkerIcon(L, colorOf("center"), "center"),
      }).addTo(map);

      /* مکان‌های نزدیک با آیکون تخصصی */
      places.slice(0, 8).forEach((p) => {
        L.marker([p.lat, p.lng], {
          icon: makeMarkerIcon(
            L,
            colorOf(p.type),
            p.type,
            (p as any).location_type ?? "",
          ),
        }).addTo(map);
      });

      const fix = () => {
        try {
          map.invalidateSize();
        } catch {}
      };
      setTimeout(fix, 80);
      setTimeout(fix, 350);
      if (typeof ResizeObserver !== "undefined" && previewRef.current) {
        ro = new ResizeObserver(fix);
        ro.observe(previewRef.current);
      }
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      map?.remove();
    };
  }, [center.lat, center.lng, places]);

  /* ═══ نقشه کامل داخل مودال ═══ */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let map: any = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      const [L, cfg] = await Promise.all([loadLeaflet(), getMapConfig()]);
      await new Promise((r) => setTimeout(r, 80));
      if (cancelled || !modalRef.current) return;
      await waitForSize(modalRef.current);
      if (cancelled || !modalRef.current) return;

      map = L.map(modalRef.current, { center: [center.lat, center.lng], zoom: 14 });
      addTiles(L, map, cfg);

      L.marker([center.lat, center.lng], {
        icon: makeMarkerIcon(L, colorOf("center"), "center"),
      })
        .addTo(map)
        .bindPopup("مکان فعلی");

      const markers = new Map<number, any>();
      places.forEach((p) => {
        const m = L.marker([p.lat, p.lng], {
          icon: makeMarkerIcon(
            L,
            colorOf(p.type),
            p.type,
            (p as any).location_type ?? "",
          ),
        })
          .addTo(map)
          .bindPopup(`<b>${p.title}</b><br/>${p.distance_km} کیلومتر`);
        markers.set(p.id, m);
      });
      markersRef.current = markers;
      fullMapRef.current = map;

      const fix = () => {
        try {
          map.invalidateSize();
        } catch {}
      };
      setTimeout(fix, 80);
      setTimeout(fix, 300);
      setTimeout(fix, 700);
      if (typeof ResizeObserver !== "undefined" && modalRef.current) {
        ro = new ResizeObserver(fix);
        ro.observe(modalRef.current);
      }
      map.whenReady(fix);
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      map?.remove();
    };
  }, [open, places, center.lat, center.lng]);

  const focusPlace = (p: NearbyPlace) => {
    setActiveId(p.id);
    fullMapRef.current?.flyTo([p.lat, p.lng], 16, { duration: 0.9 });
    markersRef.current.get(p.id)?.openPopup();
  };

  return (
    <div>
      <div className="relative rounded-lg overflow-hidden border border-border bg-bg-sec" style={{ height }}>
        <div ref={previewRef} className="w-full h-full" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-3 start-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-lg hover:opacity-95 transition cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          نقشه کامل و مکان‌های نزدیک
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div ref={modalRef} className="flex-1 h-1/2 md:h-full" />
            <aside className="w-full md:w-80 border-t md:border-t-0 md:border-s border-divider overflow-y-auto p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">نزدیک‌ترین‌ها ({places.length})</h4>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-bg-sec transition"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {places.length === 0 && (
                <p className="text-xs text-text-muted py-6 text-center">
                  مکانی در این شعاع یافت نشد
                </p>
              )}
              {places.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => focusPlace(p)}
                  className={`w-full text-start flex gap-2.5 p-2 rounded-lg border transition cursor-pointer ${
                    activeId === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: colorOf(p.type) }}
                  >
                    {TYPE_FA[p.type]?.[0] ?? "•"}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold truncate">{p.title}</span>
                    <span className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                      <span>{p.distance_km} کیلومتر</span>
                      <span className="flex items-center gap-0.5">
                        <Footprints className="w-3 h-3" /> {p.walking_min} دقیقه
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Car className="w-3 h-3" /> {p.driving_min} دقیقه
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}