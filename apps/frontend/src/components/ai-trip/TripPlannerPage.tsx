"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import TripWizard from "./TripWizard";
import TripLoading from "./TripLoading";
import TripResult from "./TripResult";
import { DEFAULT_INPUT } from "@/lib/constants/ai-trip";
import type { TripInput, TripPlan } from "@/types/ai-trip";

type Phase = "wizard" | "loading" | "result" | "error";

export default function TripPlannerPage() {
  const params = useSearchParams();

  const initial: TripInput = {
    ...DEFAULT_INPUT,
    destination: params.get("dest") || "",
    country: params.get("country") || "",
    start_date: params.get("date") || null,
    travelers: Math.min(20, Math.max(1, Number(params.get("travelers")) || 2)),
    days: Math.min(14, Math.max(2, Number(params.get("days")) || 3)),
  };

  const [phase, setPhase] = useState<Phase>("wizard");
  const [planId, setPlanId] = useState<number | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(async (input: TripInput) => {
    setPhase("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai-trip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      /* ✅ FIX: مدیریت خطای JSON parse */
      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        setErrorMsg(
          data?.message || "خطایی رخ داد. دوباره تلاش کن.",
        );
        setPhase("error");
        return;
      }

      /* ✅ FIX: بررسی کامل status و plan */
      if (data.status === "completed") {
        if (data.plan) {
          setPlan(data.plan);
          setPhase("result");
        } else {
          setErrorMsg("برنامه ساخته شد اما داده‌ای دریافت نشد.");
          setPhase("error");
        }
        return;
      }

      /* pending → پولینگ */
      if (data.plan_id) {
        setPlanId(data.plan_id);
      } else {
        setErrorMsg("شناسه برنامه دریافت نشد.");
        setPhase("error");
      }
    } catch {
      setErrorMsg("خطا در ارتباط با سرور. اتصال اینترنت رو چک کن.");
      setPhase("error");
    }
  }, []);

  const handleSuccess = useCallback((p: TripPlan) => {
    setPlan(p);
    setPhase("result");
  }, []);

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setPhase("error");
  }, []);

  const reset = useCallback(() => {
    setPhase("wizard");
    setPlan(null);
    setPlanId(null);
    setErrorMsg("");
    window.history.replaceState(null, "", "/ai-trip");
  }, []);

  return (
    <div className="ns-container py-8 md:py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs  mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          قدرت هوش مصنوعی + تجربه تیم سفر بعدی
        </div>
        <h1 className="ns-section-title !mb-2">برنامه‌ریز سفر هوشمند</h1>
        <p className="text-sm text-text-muted max-w-xl mx-auto leading-7">
          مقصدت رو بگو، بقیه‌ش با ما! در کمتر از یک دقیقه یک برنامه سفر کامل،
          روز به روز و شخصی‌سازی‌شده تحویل بگیر
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {phase === "wizard" && (
          <TripWizard initial={initial} onSubmit={handleSubmit} />
        )}

        {phase === "loading" && planId && (
          <TripLoading
            planId={planId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {phase === "result" && plan && (
          <TripResult plan={plan} onReset={reset} />
        )}

        {phase === "error" && (
          <div className="ns-card p-10 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className=" text-lg mb-2">
              اوپس! مشکلی پیش اومد
            </h3>
            <p className="text-sm text-text-muted mb-6">{errorMsg}</p>
            <button
              onClick={reset}
              className="px-8 py-3 rounded-lg bg-gradient-to-l from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg transition"
            >
              تلاش دوباره
            </button>
          </div>
        )}
      </div>
    </div>
  );
}