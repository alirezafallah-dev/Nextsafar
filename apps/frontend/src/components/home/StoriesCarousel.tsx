"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

export interface StoryItem {
  slug: string;
  title: string;
  image: string;
  place?: string;
}

function StoryCard({ item, eager }: { item: StoryItem; eager: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Link
      href={`/destinations/${item.slug}`}
      className="group relative snap-start shrink-0 w-[200px] md:w-[240px] aspect-[3/4] rounded-[10px] md:rounded-lg overflow-hidden border border-border bg-bg-sec"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary-lightest via-white to-primary-light" />
      )}
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 200px, 240px"
        quality={85}
        loading={eager ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-all duration-200 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
      {item.place && (
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
          <MapPin className="w-3 h-3" /> {item.place}
        </span>
      )}
      <div className="absolute bottom-0 inset-x-0 px-4 py-2">
        <div className="text-white font-bold text-sm md:text-md leading-6 line-clamp-2 drop-shadow">
          {item.title}
        </div>
      </div>
    </Link>
  );
}

export default function StoriesCarousel({ items }: { items: StoryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [mounted, setMounted] = useState(false); /* ✅ flag برای جلوگیری از hydration mismatch */

  /* ✅ علامت‌گذاری mount شدن */
  useEffect(() => {
    setMounted(true);
  }, []);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setCanPrev(pos > 4);
    setCanNext(pos < max - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const isRTL = document.documentElement.dir === "rtl";
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: (isRTL ? -dir : dir) * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* ✅ فقط در کلاینت رندر شود (بعد از mount) */}
      {mounted && (
        <>
          <button
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label="قبلی"
            className="hidden md:flex absolute -start-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover border border-border items-center justify-center text-text hover:text-primary disabled:opacity-40 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label="بعدی"
            className="hidden md:flex absolute -end-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover border border-border items-center justify-center text-text hover:text-primary disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      <div
        ref={ref}
        className="ns-bleed-x flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pt-1 pb-2"
      >
        {items.map((s, idx) => (
          <StoryCard key={s.slug} item={s} eager={idx < 6} />
        ))}
      </div>
    </div>
  );
}