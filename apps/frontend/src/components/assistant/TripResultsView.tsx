"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Heart, MapPin, Star, Trash2, X } from "lucide-react";
import type { TripPlan } from "@/types/ai-trip";
import type { TripEntity } from "@/types/map";
import { formatNumber } from "@/lib/utils";
import { TYPE_FA } from "@/components/map/map-icons";
import TripMapPanel from "./TripMapPanel";

interface Props {
  plan: TripPlan;
  entities: TripEntity[];
  query?: string;
  hiddenSlugs: string[];
  favs: string[];
  onDelete: (slug: string) => void;
  onToggleFav: (slug: string) => void;
  onClose: () => void;
}

export default function TripResultsView({
  plan,
  entities,
  query,
  hiddenSlugs,
  favs,
  onDelete,
  onToggleFav,
  onClose,
}: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "map">("list");

  /* ✅ هویت آرایه ثابت می‌ماند → نقشه روی هر هاور بازسازی نمی‌شود */
  const visible = useMemo(
    () => entities.filter((e) => !hiddenSlugs.includes(e.slug)),
    [entities, hiddenSlugs],
  );
  const withCoords = useMemo(
    () => visible.filter((e) => e.lat != null && e.lng != null),
    [visible],
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ═══ هدر ═══ */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-divider bg-bg-sec/60">
        <div className="min-w-0">
          <p className="text-[10px] text-text-subtle">نتایج برای</p>
          <h2 className=" text-sm truncate">
            {query ? `«${query}»` : plan.title}
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">
            {formatNumber(visible.length)} مکان
            {(plan.days?.length ?? 0) > 0 && (
              <> • برنامه {formatNumber(plan.days!.length)} روزه</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-bg-sec shrink-0 transition"
          title="بستن نتایج"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ تب موبایل ═══ */}
      <div className="flex md:hidden border-b border-divider">
        {(["list", "map"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold transition ${
              tab === t ? "text-primary border-b-2 border-primary" : "text-text-muted"
            }`}
          >
            {t === "list" ? "لیست مکان‌ها" : "نقشه"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-3 p-3">
        {/* ═══ لیست — دو سوم ═══ */}
        <div
          className={`w-full md:w-2/3 overflow-y-auto space-y-3 pe-1 ${
            tab === "map" ? "hidden md:block" : ""
          }`}
        >
          {visible.length === 0 && (
            <p className="text-xs text-text-muted text-center py-10">
              همه مکان‌ها از برنامه حذف شده‌اند
            </p>
          )}

          {visible.map((e, idx) => {
            const isFav = favs.includes(e.slug);
            return (
              <div
                key={e.slug}
                /* ✅ فقط hover — هیچ setView/flyTo/setTab اینجا نیست */
                onMouseEnter={() => setHover(e.slug)}
                onMouseLeave={() => setHover(null)}
                className={`relative flex gap-3 rounded-lg border p-3 transition ${
                  hover === e.slug ? "border-primary/50 shadow-sm" : "border-border"
                }`}
              >
                {/* تصویر + قلب */}
                <div className="relative shrink-0">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="block">
                    {e.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={e.image}
                        alt={e.title}
                        className="w-[130px] h-[130px] sm:w-[200px] sm:h-[200px] rounded-lg object-cover"
                      />
                    ) : (
                      <span className="w-[130px] h-[130px] sm:w-[200px] sm:h-[200px] rounded-lg bg-bg-sec flex items-center justify-center text-text-muted text-2xl">
                        {TYPE_FA[e.type]?.[0] ?? "•"}
                      </span>
                    )}
                  </a>
                  <button
                    type="button"
                    title={isFav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                    onClick={() => onToggleFav(e.slug)}
                    className={`absolute top-2 start-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition cursor-pointer ${
                      isFav ? "bg-rose-500 text-white" : "bg-white/90 text-text-muted hover:text-rose-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* محتوا */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start gap-2">
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 group"
                    >
                      <h4 className="text-sm  leading-6 group-hover:text-primary transition">
                        {formatNumber(idx + 1)}. {e.title}
                      </h4>
                    </a>
                    <button
                      type="button"
                      title="حذف از برنامه"
                      onClick={() => onDelete(e.slug)}
                      className="w-8 h-8 rounded-lg border border-border text-text-muted hover:border-danger/40 hover:text-danger hover:bg-danger/5 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 mt-1 text-[10px] text-text-muted">
                    <span className="px-1.5 py-0.5 rounded-md bg-bg-sec font-bold">
                      {TYPE_FA[e.type] ?? e.type}
                    </span>
                    {e.stars > 0 && (
                      <span className="text-amber-500 font-bold">{"★".repeat(e.stars)}</span>
                    )}
                    {e.rating > 0 && (
                      <span className="flex items-center gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {e.rating.toFixed(1)}
                      </span>
                    )}
                    {(e.days?.length ?? 0) > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                        روز {e.days!.map((d) => formatNumber(d)).join("، ")}
                      </span>
                    )}
                  </div>

                  {e.excerpt && (
                    <p className="text-[11px] text-text-muted leading-6 mt-2 line-clamp-3">
                      {e.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-dark"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      مشاهده در سایت
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ نقشه — یک سوم ═══ */}
        <div className={`w-full md:w-1/3 relative ${tab === "list" ? "hidden md:block" : ""}`}>
          <div className="w-full h-full min-h-[320px] md:min-h-0 rounded-lg overflow-hidden border border-border shadow-sm bg-bg-sec">
            {withCoords.length > 0 ? (
              /* ✅ فقط hover پاس داده می‌شود — هیچ focus وجود ندارد */
              <TripMapPanel entities={withCoords} center={null} hover={hover} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  مختصاتی یافت نشد
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}