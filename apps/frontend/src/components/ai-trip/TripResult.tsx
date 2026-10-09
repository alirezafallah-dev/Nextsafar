"use client";

import Link from "next/link";
import {
  BedDouble,
  Bus,
  CalendarDays,
  Camera,
  Coffee,
  Landmark,
  Lightbulb,
  MapPin,
  Printer,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ENTITY_URLS } from "@/lib/constants/ai-trip";
import type { TripActivity, TripPlan } from "@/types/ai-trip";

/* آیکون بر اساس نوع فعالیت */
function ActivityIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  switch (type) {
    case "food":
      return <UtensilsCrossed className={cls} />;
    case "hotel":
      return <BedDouble className={cls} />;
    case "transport":
      return <Bus className={cls} />;
    case "shopping":
      return <ShoppingBag className={cls} />;
    case "rest":
      return <Coffee className={cls} />;
    case "activity":
      return <Camera className={cls} />;
    default:
      return <Landmark className={cls} />;
  }
}

function ActivityItem({ activity }: { activity: TripActivity }) {
  /* ✅ FIX: اگر نوع "custom" بود، لینکی ساخته نمی‌شود */
  const baseUrl =
    activity.entity_type && activity.entity_type !== "custom"
      ? ENTITY_URLS[activity.entity_type]
      : undefined;

  const url = activity.slug && baseUrl ? baseUrl + activity.slug : null;

  return (
    <div className="flex gap-3 py-3">
      <div className="flex flex-col items-center">
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ActivityIcon type={activity.type} />
        </span>
        <span className="flex-1 w-px bg-border mt-2" />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs  text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {activity.time}
          </span>
          <h4 className="font-bold text-sm text-text-strong">
            {activity.title}
          </h4>
          {url && (
            <Link
              href={url}
              className="text-[11px] font-bold text-primary hover:text-primary-dark underline underline-offset-2"
            >
              مشاهده در سایت
            </Link>
          )}
        </div>
        <p className="text-xs text-text-muted leading-6">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

export default function TripResult({
  plan,
  onReset,
}: {
  plan: TripPlan;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* ═══ هدر برنامه ═══ */}
      <div className="ns-card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs  text-primary bg-primary/10 px-3 py-1 rounded-full">
                ساخته‌شده با هوش مصنوعی
              </span>
            </div>
            <h1 className=" text-xl md:text-2xl text-text-strong mb-3">
              {plan.title}
            </h1>
            <p className="text-sm text-text-muted leading-7">{plan.summary}</p>
          </div>
        </div>

        {/* بجها */}
        <div className="flex items-center gap-3 flex-wrap mt-5 pt-5 border-t border-divider">
          <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
            <CalendarDays className="w-4 h-4 text-primary" />
            {formatNumber(plan.days.length)} روز
          </span>
          {plan.total_budget_min != null && plan.total_budget_max != null && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
              <Wallet className="w-4 h-4 text-primary" />
              بودجه تقریبی: {formatNumber(plan.total_budget_min)} تا{" "}
              {formatNumber(plan.total_budget_max)} {plan.currency || "USD"}
            </span>
          )}
        </div>
      </div>

      {/* ═══ هتل پیشنهادی ═══ */}
      {plan.recommended_hotel && (
        <div className="ns-card p-5 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <BedDouble className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-text-muted mb-1">
                🏨 هتل پیشنهادی ما برای این سفر
              </div>
              <div className=" text-text-strong mb-1">
                {plan.recommended_hotel.title}
              </div>
              <p className="text-xs text-text-muted leading-6">
                {plan.recommended_hotel.reason}
              </p>
              {plan.recommended_hotel.slug && (
                <Link
                  href={`/hotels/${plan.recommended_hotel.slug}`}
                  className="inline-block mt-2 text-xs font-bold text-primary hover:text-primary-dark underline underline-offset-2"
                >
                  مشاهده و رزرو هتل ←
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ روز به روز ═══ */}
      <div className="space-y-4">
        {plan.days.map((day) => (
          <div key={day.day_number} className="ns-card overflow-hidden">
            {/* هدر روز */}
            <div className="px-6 py-4 bg-gradient-to-l from-primary/10 to-transparent border-b border-divider flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center  text-sm">
                  {formatNumber(day.day_number)}
                </span>
                <div>
                  <h3 className=" text-sm text-text-strong">
                    {day.title}
                  </h3>
                  {day.theme && (
                    <span className="text-[11px] text-text-muted">
                      {day.theme}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                {formatNumber(day.budget_min)} تا {formatNumber(day.budget_max)}{" "}
                {plan.currency || "USD"}
              </span>
            </div>

            {/* فعالیت‌ها */}
            <div className="px-6 py-2">
              {day.activities.map((a, i) => (
                <ActivityItem key={i} activity={a} />
              ))}
            </div>

            {/* نکته روز */}
            {day.tip_of_day && (
              <div className="mx-6 mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-800 leading-6">
                  {day.tip_of_day}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══ نکات کلی ═══ */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="ns-card p-6">
          <h3 className=" text-base mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            نکات مهم این سفر
          </h3>
          <ul className="space-y-2.5">
            {plan.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-muted leading-7"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══ دکمه‌های اقدام ═══ */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-l from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          ساخت برنامه جدید
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-white text-sm font-bold text-text-muted hover:bg-bg-sec transition"
        >
          <Printer className="w-4 h-4" />
          چاپ / ذخیره PDF
        </button>
      </div>
    </div>
  );
}
