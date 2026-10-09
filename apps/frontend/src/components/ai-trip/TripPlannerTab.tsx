"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  Field,
  PassengerPicker,
  SingleDatePicker,
  todayJalali,
} from "@/components/search/fields";
import DestinationField from "./DestinationField";
import TripLoading from "./TripLoading";
import TripResult from "./TripResult";
import { BUDGET_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants/ai-trip";
import type { BudgetLevel, TripInput, TripPlan } from "@/types/ai-trip";

type Phase = "form" | "loading" | "result" | "error";

export default function TripPlannerTab() {
  const [phase, setPhase] = useState<Phase>("form");
  const [planId, setPlanId] = useState<number | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [days, setDays] = useState(3);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [budget, setBudget] = useState<BudgetLevel>("medium");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : prev.length < 5
          ? [...prev, item]
          : prev,
    );
  };

  /* ═══ ارسال درخواست ═══ */
  const generate = useCallback(async (input: TripInput) => {
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
        setErrorMsg(data?.message || "خطایی رخ داد. دوباره تلاش کن.");
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs: string[] = [];
    if (destination.trim().length < 2) errs.push("مقصد را مشخص کنید");
    if (startDate) {
      const today = todayJalali();
      if (startDate < today) errs.push("تاریخ شروع نمی‌تواند در گذشته باشد");
    }
    if (errs.length) {
      setError(errs[0]);
      return;
    }
    setError("");

    const input: TripInput = {
      destination: destination.trim(),
      country: country.trim(),
      days,
      travelers: adults + kids,
      budget_level: budget,
      interests,
      start_date: startDate || null,
    };

    generate(input);
  };

  const handleSuccess = useCallback((p: TripPlan) => {
    setPlan(p);
    setPhase("result");
  }, []);

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setPhase("error");
  }, []);

  const reset = useCallback(() => {
    setPhase("form");
    setPlan(null);
    setPlanId(null);
    setErrorMsg("");
  }, []);

  if (phase === "loading" && planId) {
    return (
      <TripLoading
        planId={planId}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    );
  }

  if (phase === "result" && plan) {
    return <TripResult plan={plan} onReset={reset} />;
  }

  if (phase === "error") {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className=" text-base mb-1">مشکلی پیش اومد</h3>
        <p className="text-sm text-text-muted mb-4">{errorMsg}</p>
        <button onClick={reset} className="ns-btn ns-btn-primary">
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-divider flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted shrink-0">
            علاقه‌مندی‌ها{" "}
            <span className="text-[10px]">(اختیاری — حداکثر ۵)</span>:
          </span>
          {INTEREST_OPTIONS.map((item) => {
            const selected = interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                  selected
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-border text-text-muted hover:border-primary/50 hover:text-primary"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <span className="hidden md:block text-xs text-text-muted shrink-0">
          💡 برنامه بر اساس سلیقه تو شخصی‌سازی می‌شه
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="مقصد" className="flex-1 min-w-[200px]">
          <DestinationField
            value={{ destination, country }}
            onChange={(v) => {
              setDestination(v.destination);
              setCountry(v.country);
            }}
            placeholder="کجا می‌خوای بری؟"
          />
        </Field>

        <div className="flex-1 min-w-[180px]">
          <SingleDatePicker
            value={startDate}
            onChange={setStartDate}
            label="تاریخ شروع (اختیاری)"
            placeholder="انتخاب کنید"
          />
        </div>

        <Field label="مدت سفر" className="w-[110px]">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="ns-input w-full"
          >
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((d) => (
              <option key={d} value={d}>
                {d} روز
              </option>
            ))}
          </select>
        </Field>

        <Field label="بودجه" className="w-[130px]">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as BudgetLevel)}
            className="ns-input w-full"
          >
            {BUDGET_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="مسافران" className="w-[180px]">
          <PassengerPicker
            adults={adults}
            children={kids}
            onChange={(a, c) => {
              setAdults(a);
              setKids(c);
            }}
          />
        </Field>

        <button type="submit" className="ns-btn ns-btn-primary h-[48px]">
          <Sparkles className="w-4 h-4" />
          ساخت برنامه سفر
        </button>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </form>
  );
}