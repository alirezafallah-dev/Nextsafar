"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { TripPlan } from "@/types/ai-trip";

const MESSAGES = [
  "✨ هوش مصنوعی داره مقصدت رو بررسی می‌کنه...",
  "🏨 در حال انتخاب بهترین هتل‌ها...",
  "🗺️ در حال چیدن برنامه روز به روز...",
  "🍽️ در حال پیدا کردن رستوران‌های خوشمزه...",
  "💰 در حال محاسبه هزینه‌های سفر...",
  "✈️ در حال نوشتن نکات و پیشنهادهای ویژه...",
];

/* ✅ FIX: مقادیر بهینه‌شده */
const POLL_INTERVAL = 4000;    // فاصله بین پولینگ‌ها
const POLL_TIMEOUT = 30000;    // ✅ کاهش از 95000 به 30000
const MAX_TRIES = 60;          // ≈ ۴ دقیقه سقف کل
const MAX_RETRIES = 2;         // ✅ حداکثر retry برای خطاهای موقت

export default function TripLoading({
  planId,
  onSuccess,
  onError,
}: {
  planId: number;
  onSuccess: (plan: TripPlan) => void;
  onError: (msg: string) => void;
}) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [debug, setDebug] = useState("");
  const stoppedRef = useRef(false);

  /* تایمر واقعی */
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  /* چرخش پیام‌ها */
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  /* ✅ FIX: refs برای callbackها */
  const cbRef = useRef({ onSuccess, onError });
  cbRef.current = { onSuccess, onError };

  /* ═══ پولینگ ایمن با retry ═══ */
  useEffect(() => {
    stoppedRef.current = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let tries = 0;
    let retryCount = 0;

    const poll = async () => {
      if (stoppedRef.current) return;
      tries += 1;

      if (tries > MAX_TRIES) {
        stoppedRef.current = true;
        cbRef.current.onError(
          "ساخت برنامه بیش از حد طول کشید. لطفاً دوباره تلاش کن.",
        );
        return;
      }

      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), POLL_TIMEOUT);

      try {
        /* ✅ FIX: اضافه کردن credentials برای ارسال cookie */
        const res = await fetch(`/api/ai-trip/plan/${planId}`, {
          cache: "no-store",
          credentials: "include",  /* ✅ کوکی session رو ارسال کن */
          signal: ctrl.signal,
        });
        clearTimeout(to);

        const data = await res.json().catch(() => null);
        setDebug(`plan #${planId} • HTTP ${res.status} • ${data?.status ?? "—"} • tries: ${tries}`);

        if (stoppedRef.current) return;

        if (res.ok && data?.status === "completed") {
          stoppedRef.current = true;
          cbRef.current.onSuccess(data as TripPlan);
          return;
        }

        if (data?.status === "failed") {
          stoppedRef.current = true;
          cbRef.current.onError(
            data?.meta?.error_message || "خطا در ساخت برنامه. دوباره تلاش کن.",
          );
          return;
        }

        /* ✅ success → reset retry counter */
        retryCount = 0;

        /* pending → ادامه پولینگ */
      } catch (err) {
        clearTimeout(to);
        setDebug(`plan #${planId} • network/timeout • retry: ${retryCount}/${MAX_RETRIES}`);

        /* ✅ FIX: retry برای خطاهای موقت */
        if (retryCount < MAX_RETRIES && !stoppedRef.current) {
          retryCount++;
          timer = setTimeout(poll, 2000);  /* retry سریع‌تر */
          return;
        }
      }

      if (!stoppedRef.current) timer = setTimeout(poll, POLL_INTERVAL);
    };

    timer = setTimeout(poll, 2500);

    return () => {
      stoppedRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [planId]);

  return (
    <div className="p-10 md:p-16 text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
      </div>

      <h3 className=" text-xl mb-3">
        در حال ساخت برنامه سفر تو هستیم!
      </h3>

      <p className="text-sm font-bold text-primary mb-6 min-h-6">
        {MESSAGES[msgIdx]}
      </p>

      <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>زمان سپری‌شده: {elapsed} ثانیه</span>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6">
        {MESSAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= msgIdx ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {debug && (
        <p className="mt-4 text-[10px] text-text-subtle font-mono" dir="ltr">
          {debug}
        </p>
      )}
    </div>
  );
}