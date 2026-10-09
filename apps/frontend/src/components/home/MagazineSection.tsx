import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { getGuidePosts, getNewsPosts, formatFaDate } from "@/lib/api/home";

/* ✅ مجله = فقط travelguide • اخبار = فقط travelnews */
export default async function MagazineSection() {
  const [guides, news] = await Promise.all([
    getGuidePosts(4),
    getNewsPosts(6),
  ]);
  if (guides.length === 0 && news.length === 0) return null;
  const [feature, ...restGuides] = guides;

  return (
    <section className="ns-container py-8 md:py-12">
      <SectionHeader
        title="مجله سفر"
        subtitle="راهنماها و تجربه‌های خواندنی تیم نکست‌سفر"
        href="/travel-guides"
        linkLabel="همه مطالب"
      />

      <div className="grid md:grid-cols-2 gap-3 md:gap-6">
        {/* کارت ویژه — ✅ Radius کارت: 10 / 12 */}
        {feature && (
          <Link
            href={`/travel-guides/${feature.slug}`}
            className="relative overflow-hidden rounded-[10px] sm:rounded-lg group aspect-[16/10] md:aspect-auto md:min-h-[320px]"
          >
            {feature.image ? (
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary-dark/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
              {feature.category && (
                <span className="inline-block px-2 py-1 rounded-lg bg-primary text-white text-[9px] font-bold mb-2">
                  {feature.category}
                </span>
              )}
              <h3 className="text-white text-base md:text-xl leading-7 md:leading-8 line-clamp-2">
                {feature.title}
              </h3>
              {feature.excerpt && (
                <p className="text-white/70 text-[11px] md:text-xs leading-6 mt-2 line-clamp-2">
                  {feature.excerpt}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* لیست فشرده — ✅ تصاویر کوچک: 8px */}
        <div className="flex flex-col divide-y divide-divider">
          {restGuides.map((g) => (
            <Link
              key={g.id}
              href={`/travel-guides/${g.slug}`}
              className="flex items-center gap-3 py-3 group"
            >
              <div className="relative w-20 h-16 md:w-24 md:h-16 rounded-lg overflow-hidden shrink-0 bg-bg-sec">
                {g.image ? (
                  <Image src={g.image} alt={g.title} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-text-muted/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-bold leading-6 line-clamp-2 group-hover:text-primary transition">
                  {g.title}
                </h4>
                <p className="text-[10px] text-text-muted mt-1">
                  {g.category ?? "راهنمای سفر"}
                  {g.date ? ` • ${formatFaDate(g.date)}` : ""}
                </p>
              </div>
              <ArrowLeft className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ آخرین اخبار ═══ */}
      {news.length > 0 && (
        <>
          <SectionHeader
            className="mt-10 md:mt-14"
            title="آخرین اخبار گردشگری"
            subtitle="تازه‌های دنیای سفر، پرواز و هتل‌ها"
            href="/travel-news"
            linkLabel="همه اخبار"
          />

          {/* ✅ FIX: ns-bleed-x → snap روی گاتر 16px قفل می‌شه، نه لبه صفحه */}
          <div className="ns-bleed-x flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {news.map((n) => (
              <Link
                key={n.id}
                href={`/travel-news/${n.slug}`}
                className="w-[72%] sm:w-[46%] md:w-auto shrink-0 snap-start rounded-[10px] sm:rounded-lg border border-border bg-white p-3 md:p-4 hover:border-primary/40 hover:shadow-card-hover transition group"
              >
                <p className="text-[10px] font-bold text-primary mb-1.5">
                  {n.category ?? "خبر گردشگری"}
                  {n.date ? ` • ${formatFaDate(n.date)}` : ""}
                </p>
                <h4 className="text-[11px] md:text-xs font-bold leading-6 line-clamp-2 group-hover:text-primary transition">
                  {n.title}
                </h4>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}