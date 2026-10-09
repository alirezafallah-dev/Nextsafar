"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Zap, Headphones } from "lucide-react";
import SearchWidget from "./SearchWidget";
import HeroBackground from "./HeroBackground";
import { HERO_TABS, HERO_FALLBACK } from "@/lib/constants/hero-images";

export default function HomeHero() {
  const [tabId, setTabId] = useState("flight");
  const [isDesktop, setIsDesktop] = useState(false);

  /* ✅ فقط در دسکتاپ (>=768px) تصاویر هیرو mount می‌شن */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ✅ fallback امن اگر تب در HERO_TABS نبود */
  const tab = HERO_TABS[tabId] ?? HERO_FALLBACK;

  return (
    <section className="ns-container pt-6 md:pt-7">
      {/* ✅ موبایل: بدون عکس و بدون متن روی آن — فقط دسکتاپ */}
      <h1 className="md:hidden sr-only">{tab.title}</h1>

      <div className="relative rounded-lg md:rounded-[20px] overflow-hidden h-[500px] isolate bg-gradient-to-b from-[#0b1e3a] to-[#123a6b] hidden md:block">
        {isDesktop && <HeroBackground activeTab={tabId} />}
        <div className="absolute top-0 start-0 z-10 p-8 max-w-2xl text-start">
          <h1 className="text-4xl text-white mb-2 leading-tight [text-shadow:_0_2px_16px_rgba(0,0,0,0.65)]">
            {tab.title}
          </h1>
          <p className="text-lg text-white/95 [text-shadow:_0_1px_10px_rgba(0,0,0,0.6)]">
            {tab.subtitle}
          </p>
        </div>
      </div>

      {/* ═══ کارت جستجو — موبایل: بالای صفحه بدون همپوشانی / دسکتاپ: شناور ═══ */}
      <div className="relative z-20 md:-mt-28 md:px-8">
        <SearchWidget activeTab={tabId} onTabChange={setTabId} float />
      </div>

      {/* ═══ ردیف اعتماد ═══ */}
      <div className="mt-5 md:mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-text-muted text-xs md:text-sm">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> پرداخت امن
        </span>
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> صدور آنی واچر
        </span>
        <span className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" /> پشتیبانی ۲۴/۷
        </span>
      </div>
    </section>
  );
}