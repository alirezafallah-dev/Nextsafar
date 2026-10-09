"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateTripPlan, getTripPlanStatus } from "@/lib/api/ai-trip";
import type { TripInput, TripPlan } from "@/types/ai-trip";

export type PlannerPhase = "idle" | "loading" | "result" | "error";

const MAX_POLLS = 60;      // ✅ افزایش از 30 به 60
const POLL_INTERVAL = 4000;

/**
 * هوک مرکزی برنامه‌ریز سفر
 */
export function useTripPlanner() {
  const [phase, setPhase] = useState<PlannerPhase>("idle");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState("");
  const stoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
    };
  }, []);

  /* پولینگ وضعیت تا تکمیل یا خطا */
  const pollStatus = useCallback(async (planId: number) => {
    let tries = 0;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    while (tries < MAX_POLLS && !stoppedRef.current) {
      tries++;
      try {
        const data = await getTripPlanStatus(planId);
        if (stoppedRef.current) return;

        /* ✅ success → reset retry counter */
        retryCount = 0;

        if (data.status === "completed") {
          setPlan(data);
          setPhase("result");
          return;
        }
        if (data.status === "failed") {
          setError(data.meta?.error_message || "خطا در ساخت برنامه.");
          setPhase("error");
          return;
        }
      } catch {
        /* ✅ FIX: retry برای خطاهای شبکه */
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }

    if (!stoppedRef.current) {
      setError("ساخت برنامه بیش از حد طول کشید. دوباره تلاش کن.");
      setPhase("error");
    }
  }, []);

  /* ثبت درخواست ساخت */
  const submit = useCallback(
    async (input: TripInput) => {
      setPhase("loading");
      setError("");
      stoppedRef.current = false;

      try {
        const res = await generateTripPlan(input);
        if (stoppedRef.current) return;

        /* ✅ FIX: بررسی کامل status و plan */
        if (res.status === "completed") {
          if (res.plan) {
            setPlan(res.plan);
            setPhase("result");
            return;
          }
          setError("برنامه ساخته شد اما داده‌ای دریافت نشد.");
          setPhase("error");
          return;
        }

        /* pending → پولینگ */
        if (res.plan_id) {
          pollStatus(res.plan_id);
        } else {
          setError("شناسه برنامه دریافت نشد.");
          setPhase("error");
        }
      } catch (e) {
        if (stoppedRef.current) return;
        setError(e instanceof Error ? e.message : "خطا در ارتباط با سرور.");
        setPhase("error");
      }
    },
    [pollStatus]
  );

  const reset = useCallback(() => {
    stoppedRef.current = true;
    setPhase("idle");
    setPlan(null);
    setError("");
  }, []);

  return { phase, plan, error, submit, reset };
}