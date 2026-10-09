"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HERO_TABS } from "@/lib/constants/hero-images";

/* ═══════════════════════════════════════════════════════
   ✅ نسخه بهینه:
   - فقط تصویر تب فعال render می‌شه (گیت موبایل در HomeHero)
   - LCP: preload رسانه‌ای در page.tsx (فقط دسکتاپ)
   - چرخش: تصویر بعدی از قبل preload
   - سوئیچ تب: تصویر اول تب‌های دیگر در idle preload
   - کراس‌فید: لایه قبلی زیر می‌مونه تا fade-in جدید
═══════════════════════════════════════════════════════ */

/* ✅ Helper امن برای preload (بدون درگیری با import next/image) */
function preloadImage(src: string) {
  if (typeof window === "undefined") return;
  const img = document.createElement("img");
  img.src = src;
}

export default function HeroBackground({ activeTab }: { activeTab: string }) {
  const [i, setI] = useState(0);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const lastSrc = useRef<string>("");

  const activeImages = HERO_TABS[activeTab]?.images ?? [];
  const activeSrc = activeImages[i % (activeImages.length || 1)] ?? "";

  /* چرخش خودکار فقط وقتی تب فعال بیش از یک تصویر دارد */
  useEffect(() => {
    setI(0);
    if (activeImages.length < 2) return;
    const t = setInterval(
      () => setI((v) => (v + 1) % activeImages.length),
      6000,
    );
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeImages.length]);

  /* کراس‌فید: تصویر قبلی زیر می‌مونه تا تصویر جدید fade-in بشه */
  useEffect(() => {
    if (!activeSrc || lastSrc.current === activeSrc) return;
    const old = lastSrc.current;
    lastSrc.current = activeSrc;
    if (old) {
      setPrevSrc(old);
      const t = setTimeout(() => setPrevSrc(null), 600);
      return () => clearTimeout(t);
    }
  }, [activeSrc]);

  /* preload تصویر بعدیِ چرخش */
  useEffect(() => {
    const next = activeImages[(i + 1) % activeImages.length];
    if (next && next !== activeSrc) preloadImage(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, activeTab]);

  /* idle: preload تصویر اول تب‌های دیگر (سوئیچ آنی، بعد از LCP) */
  useEffect(() => {
    const idle: (cb: () => void) => number =
      "requestIdleCallback" in window
        ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 4000 })
        : (cb) => window.setTimeout(cb, 2500) as unknown as number;

    const id = idle(() => {
      Object.entries(HERO_TABS).forEach(([tab, def]) => {
        if (tab === activeTab) return;
        const src = def?.images?.[0];
        if (src) preloadImage(src);
      });
    });
    return () => {
      if ("cancelIdleCallback" in window) (window as any).cancelIdleCallback(id);
      else clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="absolute inset-0">
      {/* لایه قبلی برای کراس‌فید */}
      {prevSrc && (
        <Image
          src={prevSrc}
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="object-cover"
          aria-hidden
        />
      )}
      {/* لایه فعال */}
      {activeSrc && (
        <Image
          key={activeSrc}
          src={activeSrc}
          alt=""
          fill
          sizes="100vw"
          quality={85}
          loading="eager"
          fetchPriority="high"
          className="object-cover animate-ns-fade"
        />
      )}
    </div>
  );
}