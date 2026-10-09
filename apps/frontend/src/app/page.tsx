import type { Metadata } from "next";
import HomeHero from "@/components/home/HomeHero";
import StatsBar from "@/components/home/StatsBar";
import DestinationStories from "@/components/home/DestinationStories";
import TrendingNow from "@/components/home/TrendingNow";
import FeaturedHotels from "@/components/home/FeaturedHotels";
import AiTripBanner from "@/components/home/AiTripBanner";
import CollectionsSection from "@/components/home/CollectionsSection";
import VisaSection from "@/components/home/VisaSection";
import MagazineSection from "@/components/home/MagazineSection";
import LeadCaptureBand from "@/components/home/LeadCaptureBand";
import TrustSection from "@/components/home/TrustSection";

/* ═══ آدرس پایه سایت ═══ */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nextsafar.com";

/* ═══════════════════════════════════════════════════════
   ✅ سئوی صفحه اصلی: متا + Open Graph + Twitter
═══════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  title: {
    absolute: "سفر بعدی | رزرو پرواز، هتل، تور و ویزا با دستیار هوشمند سفر",
  },
  description:
    "سفر بعدی ایرانیان؛ رزرو آنی پرواز، هتل و تور، خدمات ویزا و راهنمای سفر مقاصد پرطرفدار، همراه با برنامه‌ریز هوشمند سفر با هوش مصنوعی. پشتیبانی ۲۴/۷ و پرداخت امن.",
  keywords: [
    "رزرو هتل",
    "بلیط پرواز",
    "تور مسافرتی",
    "ویزا",
    "راهنمای سفر",
    "برنامه ریزی سفر با هوش مصنوعی",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "سفر بعدی",
    title: "سفر بعدی | رزرو پرواز، هتل، تور و ویزا",
    description:
      "رزرو آنی پرواز، هتل و تور + برنامه‌ریز هوشمند سفر با AI؛ همراه با راهنمای سفر و خدمات ویزا.",
    images: [
      {
        url: `${SITE_URL}/images/og-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "سفر بعدی ایرانیان",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سفر بعدی | رزرو پرواز، هتل، تور و ویزا",
    description: "رزرو آنی پرواز، هتل و تور + برنامه‌ریز هوشمند سفر با AI.",
  },
  robots: { index: true, follow: true },
};

/* ═══════════════════════════════════════════════════════
   ✅ JSON-LD: Organization + WebSite + SearchAction
═══════════════════════════════════════════════════════ */
import { HERO_TABS } from "@/lib/constants/hero-images";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "سفر بعدی ایرانیان",
      alternateName: "Next Safar Iranian",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
        width: 150,
        height: 50,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+98-21-82801754",
        contactType: "customer support",
        areaServed: "IR",
        availableLanguage: ["fa"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "تهران",
        addressRegion: "تهران",
        streetAddress: "صادقیه، فلکه اول، مجتمع تجاری گلدیس",
        addressCountry: "IR",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "سفر بعدی",
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* ✅ preload تصویر LCP فقط برای دسکتاپ (موبایل هیرو تصویر نداره) */}
      <link
        rel="preload"
        as="image"
        href={HERO_TABS.flight.images[0]}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      
      {/* ✅ داده ساختاریافته برای گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* سکشن ۱: هیرو + جستجو */}
      <HomeHero />
      {/* سکشن ۲: نوار آمار زنده */}
      <StatsBar />
      {/* سکشن ۳: استوری مقاصد */}
      <DestinationStories />
      {/* سکشن ۴: داغ‌ترین‌ها */}
      <TrendingNow />
      {/* سکشن ۵: هتل‌های برگزیده */}
      <FeaturedHotels />
      {/* سکشن ۷: بنر AI Trip Planner */}
      <AiTripBanner />
      {/* سکشن ۹: شهرهای پرطرفدار */}
      <CollectionsSection />
      {/* سکشن ۸: خدمات ویزا */}
      <VisaSection />
      {/* سکشن ۱۲: مجله + اخبار */}
      <MagazineSection />
      {/* ✅ بند Lead-Capture: هشدار کاهش قیمت */}
      <LeadCaptureBand />
      {/* سکشن ۱۳: اعتماد + مجوزها */}
      <TrustSection />
    </>
  );
}