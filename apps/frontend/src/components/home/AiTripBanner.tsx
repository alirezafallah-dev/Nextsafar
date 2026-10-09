import Link from "next/link";
import { Sparkles, ArrowLeft, CalendarDays, Map, Zap } from "lucide-react";

export default function AiTripBanner() {
  return (
    <section className="ns-container py-8 md:py-12">
      {/* ═══ کارت گرادیان تیره ═══ */}
      <div className="relative overflow-hidden rounded-lg md:rounded-[20px] bg-gradient-to-br from-primary-dark via-primary to-primary-dark p-6 md:p-10 text-white">
        {/* پس‌زمینه دکوراتیو */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* محتوا */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* متن */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span className="text-sm font-bold text-amber-200">
                دستیار هوشمند سفر بعدی
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
              برنامه سفر شخصی‌ات رو با AI بساز
            </h2>
            <p className="text-sm md:text-base text-white/90 leading-7 max-w-2xl">
              مقصد، تاریخ و بودجه‌ات رو بگو؛ ما در چند ثانیه یک برنامه سفر کامل با هتل‌ها، رستوران‌ها و جاذبه‌های منتخب برات می‌چینیم.
            </p>

            {/* ویژگی‌ها */}
            <div className="flex flex-wrap gap-4 mt-5 text-xs md:text-sm">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-amber-300" />
                برنامه روز به روز
              </span>
              <span className="flex items-center gap-1.5">
                <Map className="w-4 h-4 text-amber-300" />
                نقشه تعاملی
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300" />
                آماده در چند ثانیه
              </span>
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/ai-trip"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-primary-dark font-bold text-sm hover:bg-amber-50 transition shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              شروع کن — رایگان
            </Link>
            <Link
              href="/ai-trip"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition"
            >
              نمونه برنامه‌ها
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}