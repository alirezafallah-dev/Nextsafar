/* ═══════════════════════════════════════════════════════════
   تنظیمات هیرو: تصویر + متن هر تب
   برای چرخش ۶ ثانیه‌ای، عکس دوم رو به آرایه اضافه کن
═══════════════════════════════════════════════════════════ */
export interface HeroTabConfig {
  title: string;
  subtitle: string;
  images: string[];
}

export const HERO_TABS: Record<string, HeroTabConfig> = {
  flight: {
    title: "پروازت رو هوشمندانه انتخاب کن",
    subtitle: "مقایسه لحظه‌ای قیمت همه ایرلاین‌ها",
    images: ["/images/hero/flight-1.jpg"],
  },
  hotel: {
    title: "اقامتی که لایقته",
    subtitle: "هتل‌های داخلی و خارجی با تضمین بهترین قیمت",
    images: ["/images/hero/hotel-1.jpg"],
  },
  tour: {
    title: "ماجراجویی بعدی از اینجا شروع می‌شه",
    subtitle: "تورهای داخلی و خارجی با برنامه‌ریزی کامل",
    images: ["/images/hero/tour-1.jpg"],
  },
  destination: {
    title: "به کجا می‌خواهید بروید؟",
    subtitle: "صدها مقصد منتظر کشف شدن هستند",
    images: ["/images/hero/destination-1.jpg"],
  },
  visa: {
    title: "ویزا بدون دردسر",
    subtitle: "چک‌لیست مدارک و پیگیری مرحله‌به‌مرحله",
    images: ["/images/hero/visa-1.jpg"],
  },
  restaurant: {
    title: "شکم‌گردی در سفر",
    subtitle: "بهترین رستوران‌ها و کافه‌های هر مقصد",
    images: ["/images/hero/restaurant-1.jpg"],
  },
  airport: {
    title: "فرودگاه رو مثل حرفه‌ای‌ها بشناس",
    subtitle: "اطلاعات پرواز، خدمات و تشریفات فرودگاهی",
    images: ["/images/hero/airport-1.jpg"],
  },
  hospital: {
    title: "سفری برای سلامتی",
    subtitle: "بیمارستان‌های معتبر با پکیج کامل درمان و اقامت",
    images: ["/images/hero/hospital-1.jpg"],
  },
  travelguide: {
    title: "مثل یک محلی سفر کن",
    subtitle: "راهنماهای کامل سفر به سراسر جهان",
    images: ["/images/hero/travelguide-1.jpg"],
  },
};

export const HERO_FALLBACK: HeroTabConfig = {
  title: "به کجا می‌خواهید بروید؟",
  subtitle: "پرواز، هتل، تور و ویزا؛ همه یکجا در سفر بعدی",
  images: ["/images/hero/destination-1.jpg"],
};