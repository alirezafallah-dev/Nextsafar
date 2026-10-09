import Link from "next/link";
import Image from "next/image";
import { Flame, Layers, MapPin } from "lucide-react";
import { getTourismTerms, formatFa } from "@/lib/api/home";
import SectionHeader from "./SectionHeader";

/* پالت گرادیان فال‌بک */
const GRADS = [
  "from-indigo-600 via-purple-600 to-primary",
  "from-rose-600 via-orange-500 to-amber-500",
  "from-teal-600 via-cyan-600 to-sky-500",
  "from-fuchsia-600 via-pink-600 to-rose-500",
];

/* بج رتبه: طلا / نقره / برنز / ساده */
const RANK_STYLES = [
  "bg-gradient-to-l from-amber-300 to-yellow-500 text-amber-950",
  "bg-gradient-to-l from-slate-200 to-slate-400 text-slate-900",
  "bg-gradient-to-l from-orange-300 to-amber-600 text-orange-950",
];

export default async function CollectionsSection() {
  const terms = await getTourismTerms(8);
  if (terms.length === 0) return null;

  return (
    <section className="ns-container py-8 md:py-12">
      <SectionHeader
        title="شهرهای پرطرفدار"
        subtitle="محبوب‌ترین شهرها بر اساس محتوا و بازدید کاربران سفر بعدی"
        href="/tourism"
        linkLabel="همه شهرها"
      />

      {/* گرید یکنواخت — ✅ Radius کارت: 10 موبایل / 12 تبلت+دسکتاپ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
        {terms.map((t, i) => (
          <Link
            key={t.id}
            href={`/tourism/${t.slug}`}
            className="group relative block overflow-hidden rounded-[10px] sm:rounded-lg h-52 md:h-64 ring-1 ring-black/5 hover:ring-2 hover:ring-primary/60 transition-shadow"
          >
            {t.image ? (
              <Image
                src={t.image}
                alt={t.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADS[i % GRADS.length]}`}>
                <span className="absolute inset-0 flex items-center justify-center text-white/15 text-6xl md:text-7xl font-black select-none">
                  {t.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 transition-colors group-hover:from-black/90" />

            {/* ردیف بالا: بج رتبه + تعداد مطلب (✅ 8px) */}
            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1">
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black shadow-md ${
                  RANK_STYLES[i] ?? "bg-black/45 backdrop-blur-sm text-white"
                }`}
              >
                {i < 3 && <Flame className="w-3 h-3" />}
                رتبه {formatFa(i + 1)}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/45 backdrop-blur-sm text-white text-[9px] font-bold">
                <Layers className="w-3 h-3" />
                {formatFa(t.count)} مطلب
              </span>
            </div>

            {/* پایین: کشور والد + نام شهر */}
            <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
              {t.country && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-white text-[8.5px] md:text-[9px] font-bold mb-1.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {t.country}
                </span>
              )}
              <h3 className="text-white text-sm md:text-base leading-6 line-clamp-1">
                {t.name}
              </h3>
              <span className="block h-0.5 w-8 bg-primary rounded-full mt-2 transition-all duration-500 group-hover:w-full" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}