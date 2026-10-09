"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { getNearbyForPost } from "@/lib/api/map";
import type { NearbyPlace } from "@/types/map";
import NearbyMap from "./NearbyMap";

interface PostNearbyMapProps {
  postType: string;
  slug: string;
  radius?: number;
}

/**
 * ✅ نقشه تنبل: فقط وقتی بخش نقشه وارد viewport شد
 * Leaflet و کاشی‌ها لود می‌شوند — نه در لود اولیه صفحه
 */
export default function PostNearbyMap({
  postType,
  slug,
  radius = 5,
}: PostNearbyMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);

  /* ═══ شروع فقط وقتی نقشه دیده شد ═══ */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px" }, // ۲۵۰px زودتر شروع کن
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ═══ یک درخواست واحد + کش ═══ */
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    setState("loading");
    (async () => {
      const res = await getNearbyForPost({ postType, slug, radius });
      if (cancelled) return;
      if (!res || !res.has_center || !res.center) {
        setState("empty");
        return;
      }
      setCenter(res.center);
      setPlaces(res.places ?? []);
      setState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, postType, slug, radius]);

  /* بدون مختصات → هیچ چیزی رندر نشود */
  if (state === "empty") return <div ref={wrapRef} />;

  return (
    <div ref={wrapRef}>
      <section className="ns-card p-5 md:p-6">
        <h3 className=" text-base mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          نقشه و مکان‌های نزدیک
        </h3>

        {state === "ready" && center ? (
          <NearbyMap center={center} places={places} />
        ) : (
          /* ✅ Skeleton سبک — بدون لود Leaflet */
          <div className="relative rounded-lg overflow-hidden border border-border h-[260px] bg-bg-sec animate-pulse flex items-center justify-center">
            <span className="text-xs text-text-muted">
              در حال آماده‌سازی نقشه…
            </span>
          </div>
        )}
      </section>
    </div>
  );
}