"use client";

import { useEffect, useRef } from "react";
import type { TripEntity } from "@/types/map";
import { loadLeaflet, waitForSize, scheduleFix } from "@/lib/map-loader";
import { getMapConfig } from "@/lib/api/map";
import { addTiles, colorOf, makeNumberedMarker } from "@/components/map/map-icons";

interface TripMapPanelProps {
  entities: TripEntity[];
  center?: { lat: number; lng: number } | null;
  hover?: string | null;
}

/**
 * ✅ قانون طلایی این کامپوننت:
 * هیچ متد حرکتی نقشه (setView / flyTo / panTo) بیرون از init صدا زده نمی‌شود.
 * هاور = فقط استایل مارکر (کمی بزرگ‌تر + بولدتر + روی بقیه).
 */
export default function TripMapPanel({ entities, center, hover }: TripMapPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  /* ═══ init نقشه — فقط وقتی موجودیت‌ها واقعاً عوض شوند ═══ */
  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    let ro: ResizeObserver | null = null;
    let clearFix: (() => void) | null = null;
    let onResize: (() => void) | null = null;

    (async () => {
      const [L, cfg] = await Promise.all([loadLeaflet(), getMapConfig()]);
      if (cancelled || !ref.current) return;
      await waitForSize(ref.current);
      if (cancelled || !ref.current) return;

      map = L.map(ref.current, {
        zoomControl: true,
        attributionControl: false,
        updateWhenZooming: false,
      });
      addTiles(L, map, cfg);

      const pins = entities.filter((e) => e.lat != null && e.lng != null);
      const markers = new Map<string, any>();

      pins.forEach((e, idx) => {
        const icon = makeNumberedMarker(L, colorOf(e.type), idx + 1);
        const m = L.marker([e.lat!, e.lng!], { icon })
          .addTo(map)
          .bindPopup(
            `<b>${e.title}</b><br/><a href="${e.url}" style="color:#0ea5e9">مشاهده در سایت</a>`,
          );
        markers.set(e.slug, m);
      });
      markersRef.current = markers;

      const pts: [number, number][] = pins.map((e) => [e.lat!, e.lng!]);
      if (center) pts.push([center.lat, center.lng]);

      if (pts.length) {
        /* زوم ثابت: همه مکان‌ها دیده شوند */
        map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 15 });
      } else {
        map.setView([35.7, 51.4], 5);
      }

      clearFix = scheduleFix(map);
      onResize = () => {
        if (cancelled) return;
        try {
          map?.invalidateSize();
        } catch {}
      };
      window.addEventListener("resize", onResize);
      if (typeof ResizeObserver !== "undefined" && ref.current) {
        ro = new ResizeObserver(onResize);
        ro.observe(ref.current);
      }
    })();

    return () => {
      cancelled = true;
      clearFix?.();
      if (onResize) window.removeEventListener("resize", onResize);
      ro?.disconnect();
      markersRef.current.clear();
      try {
        map?.remove();
      } catch {}
    };
  }, [entities, center]);

  /* ═══ ✅ هاور = فقط مارکر متمایز می‌شود؛ نقشه دست‌نخورده ═══ */
  useEffect(() => {
    markersRef.current.forEach((m, slug) => {
      try {
        const el = m.getElement();
        if (!el || !el.isConnected) return;
        const svg = el.querySelector("svg");
        if (!svg) return;

        if (slug === hover) {
          m.setZIndexOffset(1000);
          svg.style.transition = "transform .15s ease, filter .15s ease";
          svg.style.transformOrigin = "50% 100%";
          svg.style.transform = "scale(1.15)";
          svg.style.filter =
            "drop-shadow(0 3px 8px rgba(0,0,0,.45)) saturate(1.2) brightness(1.05)";
        } else {
          m.setZIndexOffset(0);
          svg.style.transform = "scale(1)";
          svg.style.filter = "";
        }
      } catch {}
    });
  }, [hover]);

  return <div ref={ref} className="w-full h-full min-h-[320px]" />;
}