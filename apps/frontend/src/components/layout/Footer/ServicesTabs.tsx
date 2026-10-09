"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plane,
  Newspaper,
  Building2,
  UtensilsCrossed,
  MapPin,
  BookOpen,
  Stethoscope,
  Shield,
  Sparkles,
} from "lucide-react";

interface ServiceTab {
  id: string;
  title: string;
  icon: React.ReactNode;
  heading: string;
  description: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
}

const services: ServiceTab[] = [
  {
    id: "tours",
    title: "تور و ویزا",
    icon: <Plane className="w-4 h-4" />,
    heading: "رزرو تور و خدمات ویزا با سفر بعدی",
    description:
      "سفر بعدی رزرو تور را از یک کار پرحاشیه به تجربه‌ای ساده و شفاف تبدیل می‌کند. بسته‌های داخلی و خارجی با هتل‌های تاییدشده، پروازهای به‌صرفه و ترانسفر مطمئن در چند کلیک. خدمات ویزا هم تماماً آنلاین است: چک‌لیست دقیق مدارک، آپلود امن و پیگیری مرحله‌به‌مرحله تا صدور.",
    bullets: [
      "تورهای اقتصادی، لوکس و لحظه‌ آخری",
      "مشاوره ویزا: شنگن، دبی، ترکیه و سایر مقاصد",
      "پرداخت امن + واچر و بلیت فوری",
    ],
    ctaText: "رزرو تور",
    ctaHref: "/tours",
  },
  {
    id: "news",
    title: "اخبار گردشگری",
    icon: <Newspaper className="w-4 h-4" />,
    heading: "اخبار و پایش بازار گردشگری",
    description:
      "در بخش اخبار گردشگری سفر بعدی، تیترهای مهم، تغییرات قوانین، هشدارهای پروازی و معرفی رویدادها را از منابع معتبر گردآوری می‌کنیم و خلاصه‌های کاربردی ارائه می‌دهیم تا پیش از رزرو، تصمیم آگاهانه بگیری.",
    bullets: [
      "خبرهای سنجیده از منابع رسمی",
      "تحلیل اثر مستقیم خبر بر برنامه سفر",
      "آرشیو موضوعی برای دسترسی سریع",
    ],
    ctaText: "مشاهده اخبار",
    ctaHref: "/news",
  },
  {
    id: "hotels",
    title: "اطلاعات هتل‌ها",
    icon: <Building2 className="w-4 h-4" />,
    heading: "بانک اطلاعات هتل‌ها؛ انتخاب مطمئن",
    description:
      "هر هتل فقط یک نام نیست؛ تجربه اقامت است. امکانات، موقعیت، قوانین کنسلی، امتیاز کاربران و قیمت روز را شفاف می‌بینی و در چند دقیقه بهترین گزینه را انتخاب می‌کنی—بدون سرگردانی در ده‌ها سایت.",
    bullets: [
      "فیلتر هوشمند بر اساس بودجه و سبک سفر",
      "تصاویر واقعی و نقشه دسترسی",
      "پیشنهادهای ویژه مقصدهای پرتردد",
    ],
    ctaText: "جستجوی هتل",
    ctaHref: "/hotels",
  },
  {
    id: "restaurants",
    title: "رستوران‌ها",
    icon: <UtensilsCrossed className="w-4 h-4" />,
    heading: "رستوران‌ها و طعم‌های محلی",
    description:
      "از کافه‌های دنج تا رستوران‌های محبوب؛ منو، بازه قیمت، لوکیشن و پیشنهادهای خاص هر شهر را یک‌جا ببین. با لیست‌های منتخب سفر بعدی، غذا بخشی لذت‌بخش از برنامه سفر می‌شود.",
    bullets: [
      "منوی کامل با تصاویر واقعی",
      "نظرات و امتیاز کاربران",
      "رزرو آنلاین میز",
    ],
    ctaText: "کشف رستوران‌ها",
    ctaHref: "/restaurants",
  },
  {
    id: "airports",
    title: "فرودگاه‌ها",
    icon: <Plane className="w-4 h-4" />,
    heading: "راهنمای کامل فرودگاه‌ها",
    description:
      "همه‌چیز درباره فرودگاه‌ها: ترمینال‌ها، قوانین بار، سالن‌های انتظار، CIP، ترانزیت و مسیرهای دسترسی شهری. قبل از حرکت، چند دقیقه مطالعه کن تا ورودت بی‌استرس و سریع باشد.",
    bullets: [
      "راهنمای ترمینال‌ها و گیت‌ها",
      "اطلاعات ترانزیت و CIP",
      "مسیرهای دسترسی شهری",
    ],
    ctaText: "اطلاعات فرودگاه‌ها",
    ctaHref: "/airports",
  },
  {
    id: "destinations",
    title: "مقاصد گردشگری",
    icon: <MapPin className="w-4 h-4" />,
    heading: "مقاصد؛ الهام‌بخش سفر",
    description:
      "الهام می‌خواهی؟ هر مقصد با بهترین زمان سفر، آب‌وهوا، هزینه‌ها، جاذبه‌ها، فرهنگ و غذاهای محلی معرفی شده تا مطابق سلیقه و بودجه‌ات، برنامه‌ریزی دقیقی داشته باشی.",
    bullets: [
      "بهترین زمان سفر هر مقصد",
      "معرفی جاذبه‌های گردشگری",
      "راهنمای فرهنگ و غذا",
    ],
    ctaText: "شروع الهام‌گیری",
    ctaHref: "/destinations",
  },
  {
    id: "guides",
    title: "راهنمای سفر",
    icon: <BookOpen className="w-4 h-4" />,
    heading: "راهنمای سفر؛ کوتاه، دقیق، عمل‌محور",
    description:
      "از چک‌لیست مدارک و انتخاب بیمه تا مدیریت هزینه‌ها و نکات ارزی؛ راهنماهای سفر بعدی مثل یک همسفر حرفه‌ای کنار توست.",
    bullets: [
      "چک‌لیست مدارک سفر",
      "نکات ارزی و بودجه‌بندی",
      "راهنمای بیمه مسافرتی",
    ],
    ctaText: "خواندن راهنماها",
    ctaHref: "/travelguide",
  },
  {
    id: "hospitals",
    title: "بیمارستان‌ها",
    icon: <Stethoscope className="w-4 h-4" />,
    heading: "بیمارستان‌ها و مراکز درمانی",
    description:
      "سلامت در سفر شوخی ندارد. فهرست بیمارستان‌ها، اطلاعات تماس و خدمات درمانی هر شهر را یک‌جا ببین تا در شرایط ضروری، سریع و دقیق عمل کنی.",
    bullets: [
      "فهرست بیمارستان‌های هر شهر",
      "اطلاعات تماس و آدرس",
      "خدمات اورژانس و توریست",
    ],
    ctaText: "مشاهده مراکز درمانی",
    ctaHref: "/hospitals",
  },
  {
    id: "insurance",
    title: "بیمه مسافرتی",
    icon: <Shield className="w-4 h-4" />,
    heading: "بیمه مسافرتی؛ خیال راحت سفر",
    description:
      "با بیمه مناسب، هزینه‌های درمانی، گم‌شدن چمدان یا تاخیر پرواز غافلگیرت نمی‌کند. طرح‌های متنوع، سقف پوشش شفاف و خرید آنلاین فوری در دسترس توست.",
    bullets: [
      "طرح‌های متنوع بیمه",
      "پوشش کامل پزشکی و حوادث",
      "صدور آنلاین و فوری",
    ],
    ctaText: "خرید بیمه",
    ctaHref: "/insurance",
  },
  {
    id: "cip",
    title: "خدمات CIP",
    icon: <Sparkles className="w-4 h-4" />,
    heading: "CIP؛ لوکس، سریع، بی‌دردسر",
    description:
      "از درب فرودگاه تا گیت پرواز، همه‌چیز با تیم تشریفات: پذیرایی، تحویل بار، عبور از صف‌ها و ترانسفر اختصاصی. رزرو CIP در سفر بعدی کاملاً آنلاین و قیمت‌ها شفاف است.",
    bullets: [
      "تشریفات فرودگاهی کامل",
      "تحویل بار و عبور از صف",
      "ترانسفر اختصاصی",
    ],
    ctaText: "رزرو CIP",
    ctaHref: "/cip",
  },
];

export default function ServicesTabs() {
  const [activeId, setActiveId] = useState(services[0].id);
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const activeService = services.find((s) => s.id === activeId)!;

  // ⭐ برای اینکه در لود اولیه اسکرول نکنه
  const isFirstRender = useRef(true);

  // ⭐ اسکرول خودکار تب فعال به وسط (سازگار با RTL)
  useEffect(() => {
    // در لود اولیه صفحه، اسکرول نکن
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const container = tabListRef.current;
    const tab = activeTabRef.current;
    if (!container || !tab) return;
    if (container.scrollWidth <= container.clientWidth) return;

    // اسکرول نرم تب کلیک‌شده به وسط لیست
    tab.scrollIntoView({
      behavior: "smooth",
      inline: "center", // تب در مرکز قرار بگیرد
      block: "nearest", // صفحه عمودی جابجا نشود
    });
  }, [activeId]);

  // ⭐ اسکرول افقی با چرخ ماوس
  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div>
      <h2 className="text-center text-text-strong text-2xl md:text-3xl font-bold mb-2">
        هرآنچه برای سفر نیاز دارید؛ یک‌جا در سفر بعدی
      </h2>
      <p className="text-center text-text-muted mb-6 text-sm md:text-base">
        از رزرو تور و ویزا تا اطلاعات هتل و فرودگاه‌ها؛ محتوای تخصصی، قیمت شفاف
        و پشتیبانی واقعی.
      </p>

      {/* ═══ لیست تب‌ها (اسکرول افقی + چرخ ماوس) ═══ */}
      <div
        ref={tabListRef}
        className="ns-tablist-scroll flex gap-2 overflow-x-auto pb-2"
      >
        {services.map((service) => {
          const isActive = service.id === activeId;
          return (
            <button
              key={service.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => setActiveId(service.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm whitespace-nowrap cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md border border-primary"
                  : "bg-white text-text border border-border hover:border-primary hover:text-primary-dark hover:bg-primary-lightest"
              }`}
            >
              {service.icon}
              {service.title}
            </button>
          );
        })}
      </div>

      {/* ═══ پنل محتوا — بدون انیمیشن، تعویض آنی ═══ */}
      <div className="mt-6 ns-card p-6 md:p-8 min-h-[280px]">
        <div className="grid md:grid-cols-1 gap-6 items-start">
          {/* متن */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-text-strong mb-3">
              {activeService.heading}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-5">
              {activeService.description}
            </p>
          </div>

          {/* بولت‌ها و CTA */}
          <div>
            <ul className="space-y-2 mb-6">
              {activeService.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 bg-bg-sec border border-divider rounded-lg px-4 py-3 text-sm text-text"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex-shrink-0 mt-1.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <Link
              href={activeService.ctaHref}
              className="ns-btn ns-btn-primary"
            >
              {activeService.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
