import Link from "next/link";
import Image from "next/image";
import { Clock3, FileText } from "lucide-react";
import { getVisaPosts, formatFa } from "@/lib/api/home";
import SectionHeader from "./SectionHeader";

/* برچسب فارسی ارزها */
const CURRENCY_FA: Record<string, string> = {
  USD: "دلار",
  EUR: "یورو",
  TRY: "لیر",
  AED: "درهم",
  GBP: "پوند",
  CAD: "دلار کانادا",
  IRR: "تومان",
  IRT: "تومان",
  TOMAN: "تومان",
};

function currencyLabel(code: string | null): string {
  if (!code) return "";
  return CURRENCY_FA[code.toUpperCase()] ?? code;
}

export default async function VisaSection() {
  const visas = await getVisaPosts(8);
  if (visas.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-bg-sec/60">
      <div className="ns-container">
        <SectionHeader
          title="خدمات ویزا"
          subtitle="راهنما، مدارک و شرایط جدید انواع ویزا"
          href="/visas"
          linkLabel="همه ویزاها"
        />
      </div>

      {/* کاروسل موبایل / گرید دسکتاپ — ✅ ns-bleed-x + Radius کارت 10/12 */}
      <div className="ns-container">
        <div className="ns-bleed-x flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visas.map((v) => (
            <Link
              key={v.id}
              href={`/visas/${v.slug}`}
              className="w-[70%] sm:w-[46%] md:w-auto shrink-0 snap-start overflow-hidden group rounded-[10px] sm:rounded-lg border border-border bg-white"
            >
              {/* تصویر */}
              <div className="relative aspect-[16/10] bg-bg-sec">
                {v.image ? (
                  <Image
                    src={v.image}
                    alt={v.title}
                    fill
                    sizes="(max-width: 768px) 70vw, (max-width: 1024px) 46vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-text-muted/40" />
                  </div>
                )}
                {v.category && (
                  <span className="absolute top-2 start-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold">
                    {v.category}
                  </span>
                )}
              </div>

              {/* بدنه — بدون توضیحات */}
              <div className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-extrabold leading-6 line-clamp-2 group-hover:text-primary transition">
                  {v.title}
                </h3>
                {/* قیمت از + مدت اخذ */}
                <div className="flex items-center justify-between gap-2 mt-3">
                  {v.price_min ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] md:text-[11px] font-black shrink-0">
                      از {formatFa(Math.round(v.price_min))} {currencyLabel(v.currency)}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-bg-sec text-text-muted text-[10px] md:text-[11px] font-bold shrink-0">
                      استعلام قیمت
                    </span>
                  )}
                  {v.issue && (
                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-text-muted truncate">
                      <Clock3 className="w-3 h-3 shrink-0" />
                      {v.issue}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}