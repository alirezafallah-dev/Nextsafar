"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, RefreshCw, Wallet } from "lucide-react";
import { getTripPlanStatus } from "@/lib/api/ai-trip";
import type { TripPlan } from "@/types/ai-trip";
import { formatNumber } from "@/lib/utils";

const ACTIVITY_META: Record<string, { label: string; color: string }> = {
  visit: { label: "بازدید", color: "#22c55e" },
  food: { label: "غذا", color: "#f97316" },
  hotel: { label: "هتل", color: "#0ea5e9" },
  transport: { label: "حمل‌ونقل", color: "#6366f1" },
  activity: { label: "فعالیت", color: "#a855f7" },
  shopping: { label: "خرید", color: "#eab308" },
  rest: { label: "استراحت", color: "#64748b" },
};

const POLL_MESSAGES = [
  "در حال چیدن برنامه روز به روز...",
  "دارم بهترین هتل‌ها رو بررسی می‌کنم...",
  "دارم رستوران‌های خوشمزه رو پیدا می‌کنم...",
  "دارم هزینه‌ها رو حساب می‌کنم...",
];

export default function PlanCard({
  planId,
  onReady,
  hiddenSlugs = [],
}: {
  planId: number;
  onReady?: (plan: TripPlan) => void;
  hiddenSlugs?: string[];   /* ✅ جدید */
}) {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [status, setStatus] = useState<"polling" | "done" | "failed">("polling");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const readyFired = useRef(false);

  useEffect(() => {
    if (status !== "polling") return;
    const start = Date.now();
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
      setMsgIdx((i) => (i + 1) % POLL_MESSAGES.length);
    }, 3000);
    return () => clearInterval(t);
  }, [status, retryKey]);

  useEffect(() => {
    let stopped = false;
    let tries = 0;

    const poll = async () => {
      if (stopped) return;
      tries++;
      if (tries > 90) {
        setStatus("failed");
        setError("ساخت برنامه بیش از حد طول کشید. دکمه تلاش دوباره را بزن.");
        return;
      }
      try {
        const data = await getTripPlanStatus(planId);
        if (stopped) return;
        if (data.status === "completed") {
          setPlan(data);
          setStatus("done");
          if (!readyFired.current) {
            readyFired.current = true;
            onReady?.(data);
          }
          return;
        }
        if (data.status === "failed") {
          setStatus("failed");
          setError(data.meta?.error_message || "ساخت برنامه ناموفق بود.");
          return;
        }
      } catch {
        /* ادامه پولینگ */
      }
      setTimeout(poll, 4000);
    };

    setStatus("polling");
    setTimeout(poll, 2500);
    return () => { stopped = true; };
  }, [planId, retryKey, onReady]);

  const retry = () => {
    setError("");
    setElapsed(0);
    setMsgIdx(0);
    setRetryKey((k) => k + 1);
  };

  if (status === "polling") {
    return (
      <div className="mt-2 rounded-lg border border-border bg-bg-sec px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <span>{POLL_MESSAGES[msgIdx]}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {POLL_MESSAGES.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= msgIdx ? "w-5 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
          <span className="ms-auto text-[10px] text-text-subtle" dir="ltr">{elapsed}s</span>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
        <p className="text-xs text-danger leading-6">⚠️ {error}</p>
        <button type="button" onClick={retry} className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-dark cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> تلاش دوباره
        </button>
      </div>
    );
  }

  if (!plan) return null;
/* ✅ فعالیت‌های حذف‌شده از لیست، در چت هم حذف می‌شوند */
  const days = (plan.days ?? [])
    .map((d) => ({
      ...d,
      activities: (d.activities ?? []).filter((a) => !a.slug || !hiddenSlugs.includes(a.slug)),
    }))
    .filter((d) => d.activities.length > 0);

  return (
    <div className="mt-2 rounded-lg border border-border bg-white overflow-hidden shadow-sm">
      <div className="p-5 space-y-5">
        {/* هدر */}
        <div>
          <h4 className=" text-base text-text-strong mb-2">{plan.title}</h4>
          <p className="text-sm text-text-muted leading-7 whitespace-pre-wrap">{plan.summary}</p>
        </div>

        {/* متا */}
        <div className="flex items-center flex-wrap gap-4 text-xs font-bold text-text-muted pt-3 border-t border-divider">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {formatNumber(days.length)} روز
          </span>
          {plan.total_budget_min != null && plan.total_budget_max != null && (
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-primary" />
              {formatNumber(plan.total_budget_min)} تا {formatNumber(plan.total_budget_max)} {plan.currency}
            </span>
          )}
        </div>

        {/* روزها — کامل */}
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.day_number} className="space-y-3">
              {/* عنوان روز */}
              <div className="flex items-start gap-3 pb-3 border-b border-divider">
                <span className="w-10 h-10 rounded-lg bg-primary text-white text-sm  flex items-center justify-center shrink-0">
                  {formatNumber(day.day_number)}
                </span>
                <div className="flex-1">
                  <h5 className=" text-sm mb-1">روز {formatNumber(day.day_number)}: {day.title}</h5>
                  <p className="text-xs text-text-muted leading-6">
                    بودجه: {formatNumber(day.budget_min)} تا {formatNumber(day.budget_max)} {plan.currency}
                  </p>
                </div>
              </div>

              {/* فعالیت‌ها */}
              <div className="space-y-2.5 ps-3">
                {day.activities?.map((a, i) => {
                  const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.activity;
                  return (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="font-bold text-primary shrink-0 w-12">{a.time}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: meta.color }}
                        title={meta.label}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-strong mb-0.5">{a.title}</div>
                        {a.description && (
                          <p className="text-text-muted leading-6">{a.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* نکته روز */}
              {day.tip_of_day && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mt-3">
                  <span className="text-amber-600 shrink-0">💡</span>
                  <span className="text-xs text-amber-800 leading-6">{day.tip_of_day}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* نکات کلی */}
        {plan.tips && plan.tips.length > 0 && (
          <div className="pt-4 border-t border-divider">
            <h5 className=" text-sm mb-3">نکات مهم این سفر</h5>
            <ul className="space-y-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-muted leading-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}