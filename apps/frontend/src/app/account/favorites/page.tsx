"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  BedDouble,
  Backpack,
  Plane,
  UtensilsCrossed,
  Stethoscope,
  MapPin,
  BookOpen,
  Newspaper,
  Globe,
} from "lucide-react";
import { useAccount, accMutate, Skeleton, EmptyState } from "@/components/account/ui";
import { useFavorites, pullFromServer, type FavItem } from "@/lib/favorites";
import { optimizedImage } from "@/lib/api/hotels";

/* ═══ ۸ دسته علاقه‌مندی با آیکون و لیبل ═══ */
const FAV_TABS = [
  { key: "", label: "همه", icon: Heart },
  { key: "hotel", label: "هتل", icon: BedDouble },
  { key: "tour", label: "تور", icon: Backpack },
  { key: "airport", label: "فرودگاه", icon: Plane },
  { key: "restaurant", label: "رستوران", icon: UtensilsCrossed },
  { key: "hospital", label: "بیمارستان", icon: Stethoscope },
  { key: "destination", label: "مقصد گردشگری", icon: MapPin },
  { key: "travelguide", label: "راهنمای سفر", icon: BookOpen },
  { key: "travelnews", label: "خبر", icon: Newspaper },
];

export default function FavoritesPage() {
  const [tab, setTab] = useState("");
  const { data, loading, reload } = useAccount<any>(
    `favorites${tab ? `?type=${tab}` : ""}`,
  );

  /* ❤️ هتل‌های ذخیره‌شده با سیستم جدید (قلب روی کارت‌ها) */
  const { items: hotelFavs, toggle } = useFavorites();
  useEffect(() => {
    pullFromServer();
  }, []);

  const removeOld = async (item: any) => {
    await accMutate("favorites", "DELETE", {
      type: item.type,
      object_id: item.object_id,
    });
    reload();
  };

  /* ═══ ادغام: هتل‌های جدید + هتل‌های قدیمی بدون تکرار ═══ */
  const oldItems: any[] = data?.items ?? [];
  const newTitles = new Set(
    hotelFavs.map((f) => f.title.trim().toLowerCase()),
  );
  const mergedHotels: (
    | { kind: "new"; f: FavItem }
    | { kind: "old"; o: any }
  )[] = [
    ...hotelFavs.map((f) => ({ kind: "new" as const, f })),
    ...oldItems
      .filter(
        (o) =>
          o.type === "hotel" &&
          !newTitles.has(String(o.title ?? "").trim().toLowerCase()),
      )
      .map((o) => ({ kind: "old" as const, o })),
  ];

  const otherItems = oldItems.filter((o) => o.type !== "hotel");

  const showHotels = tab === "" || tab === "hotel";
  const showOthers = tab !== "hotel";

  const totalCount =
    (showHotels ? mergedHotels.length : 0) +
    (showOthers ? otherItems.length : 0);

  return (
    <div className="space-y-5">
      <h1 className="text-lg md:text-xl font-extrabold text-text-strong">
        علاقه‌مندی‌ها
      </h1>

      {/* ═══ تب‌ها ═══ */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap pb-1">
          {FAV_TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            const count =
              t.key === "hotel"
                ? mergedHotels.length
                : t.key === ""
                  ? totalCount
                  : undefined;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-border text-text-muted hover:text-text-strong hover:border-primary-light"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {t.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      active ? "bg-white/20" : "bg-bg-sec text-text-muted"
                    }`}
                  >
                    {count.toLocaleString("fa-IR")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ محتوا ═══ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Heart}
          title={
            tab
              ? `در دسته «${FAV_TABS.find((t) => t.key === tab)?.label}» آیتمی نیست`
              : "لیست علاقه‌مندی خالیه"
          }
          desc="هتل‌ها، تورها و مقاصد مورد علاقه‌ت رو اینجا ذخیره کن"
          cta="کشف مقاصد"
          href="/destinations"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* ═══ هتل‌های سیستم جدید (قلب روی کارت جستجو) ═══ */}
          {showHotels &&
            hotelFavs.map((f) => {
              const img = optimizedImage(f.image, 400) ?? f.image;
              return (
                <div
                  key={f.key}
                  className="ns-card overflow-hidden group relative"
                >
                  <Link href={f.url || "/hotels/search"} className="block">
                    <div className="relative aspect-[4/3] bg-bg-sec">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={f.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BedDouble className="w-8 h-8 text-text-subtle/40" />
                        </div>
                      )}
                      <span className="absolute top-2 start-2 px-2 py-1 rounded-md text-[9px] font-bold bg-black/55 text-white backdrop-blur flex items-center gap-1">
                        {f.source === "site" ? (
                          "هتل سفر بعدی"
                        ) : (
                          <>
                            <Globe className="w-3 h-3" />
                            هتل آنلاین
                          </>
                        )}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="text-xs md:text-sm font-bold text-text-strong line-clamp-1">
                        {f.title}
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(f.key)}
                    className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
                    aria-label="حذف از علاقه‌مندی‌ها"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

          {/* ═══ هتل‌های قدیمی سیستم حساب کاربری ═══ */}
          {showHotels &&
            mergedHotels
              .filter((m) => m.kind === "old")
              .map((m) => {
                const o = (m as { kind: "old"; o: any }).o;
                return (
                  <div
                    key={o.id ?? o.object_id}
                    className="ns-card overflow-hidden group relative"
                  >
                    <Link href={o.url} className="block">
                      <div className="relative aspect-[4/3] bg-bg-sec">
                        {o.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={o.image}
                            alt={o.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BedDouble className="w-8 h-8 text-text-subtle/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-xs md:text-sm font-bold text-text-strong line-clamp-1">
                          {o.title}
                        </div>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeOld(o)}
                      className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
                      aria-label="حذف از علاقه‌مندی‌ها"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

          {/* ═══ سایر دسته‌ها (تور، مقصد، ...) ═══ */}
          {showOthers &&
            otherItems.map((f: any) => (
              <div key={f.id} className="ns-card overflow-hidden group relative">
                <Link href={f.url} className="block">
                  <div className="relative aspect-[4/3] bg-bg-sec">
                    {f.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.image}
                        alt={f.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-text-subtle/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs md:text-sm font-bold text-text-strong line-clamp-1">
                      {f.title}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeOld(f)}
                  className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
                  aria-label="حذف از علاقه‌مندی‌ها"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}