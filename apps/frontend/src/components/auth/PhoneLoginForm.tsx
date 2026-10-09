"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import GoogleLoginButton from "./GoogleLoginButton";

const RESEND_SECONDS = 60;
const FA = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (v: string | number) => String(v).replace(/\d/g, (d) => FA[+d]);
const maskPhone = (p: string) => `${toFa(p.slice(0, 4))} ••• ${toFa(p.slice(-3))}`;

type Step = "phone" | "otp" | "success";

export default function PhoneLoginForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const loadingRef = useRef(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setLoadingSafe = (v: boolean) => {
    loadingRef.current = v;
    setLoading(v);
  };

  /* شمارش معکوس ارسال مجدد */
  useEffect(() => {
    if (step !== "otp") return;
    setSeconds(RESEND_SECONDS);
    const iv = setInterval(
      () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(iv);
  }, [step]);

  /* فوکوس خودکار */
  useEffect(() => {
    if (step === "phone") phoneRef.current?.focus();
    if (step === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 200);
  }, [step]);

  const fail = (msg: string) => {
    setError(msg);
    setShake((s) => s + 1);
  };

  /* ═══ ارسال کد ═══ */
  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loadingRef.current) return;
    setError("");
    if (!/^09\d{9}$/.test(phone)) {
      fail("شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود");
      return;
    }
    setLoadingSafe(true);
    try {
      const r = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await r.json();
      if (!data.ok) {
        fail(
          data.error === "rate_limit"
            ? "تعداد درخواست‌ها زیاد است؛ چند دقیقه صبر کنید"
            : data.message || "ارسال کد ناموفق بود؛ دوباره تلاش کنید",
        );
        return;
      }
      setCode(Array(6).fill(""));
      setStep("otp");
    } finally {
      setLoadingSafe(false);
    }
  };

  /* ═══ تایید کد ═══ */
  const verify = async (full: string) => {
    if (loadingRef.current || full.length !== 6) return;
    setError("");
    setLoadingSafe(true);
    try {
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: full }),
      });
      const data = await r.json();
      if (!data.ok) {
        fail(
          data.error === "max_attempts"
            ? "تعداد تلاش‌ها تمام شد؛ کد جدید بگیرید"
            : "کد نامعتبر یا منقضی شده است",
        );
        setCode(Array(6).fill(""));
        otpRefs.current[0]?.focus();
        return;
      }
      setStep("success");
      await refresh();
      setTimeout(onSuccess, 1000);
    } finally {
      setLoadingSafe(false);
    }
  };

  /* ═══ هندلرهای جعبه‌های کد ═══ */
  const setDigit = (i: number, val: string) => {
    const next = [...code];
    next[i] = val;
    setCode(next);
    return next;
  };

  const handleChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(i, "");
      return;
    }
    if (digits.length === 1) {
      const next = setDigit(i, digits);
      if (i < 5) otpRefs.current[i + 1]?.focus();
      if (next.every(Boolean)) verify(next.join(""));
    } else {
      const next = [...code];
      digits
        .slice(0, 6 - i)
        .split("")
        .forEach((d, k) => {
          next[i + k] = d;
        });
      setCode(next);
      otpRefs.current[Math.min(i + digits.length, 5)]?.focus();
      if (next.every(Boolean)) verify(next.join(""));
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!digits) return;
    const next = Array(6).fill("");
    digits.split("").forEach((d, k) => {
      next[k] = d;
    });
    setCode(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) verify(digits);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {/* ═══ مرحله ۱: شماره موبایل ═══ */}
        {step === "phone" && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-strong mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <span className="absolute start-4 top-1/2 -translate-y-1/2 text-primary">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    ref={phoneRef}
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="09123456789"
                    className="ns-input !h-12 !text-left tracking-widest text-base font-bold"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  key={shake}
                  animate={{ x: [0, -8, 8, -6, 6, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-bold text-danger bg-danger/10 border border-danger/20 rounded-lg p-3"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 11}
                className="ns-btn ns-btn-primary w-full !h-12 !text-base disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                دریافت کد تایید
              </button>
            </form>

            {/* جداکننده */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divider" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] font-bold text-text-subtle">
                  یا
                </span>
              </div>
            </div>

            <GoogleLoginButton />

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              ورود بدون رمز عبور، فقط با کد یک‌بار مصرف
            </p>
          </motion.div>
        )}

        {/* ═══ مرحله ۲: کد تایید ═══ */}
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              تغییر شماره
            </button>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-text-strong mb-1">
                کد تایید را وارد کنید
              </h3>
              <p className="text-xs text-text-muted">
                پیامک کد ۶ رقمی به{" "}
                <span className="font-bold text-text-strong" dir="ltr">
                  {maskPhone(phone)}
                </span>{" "}
                ارسال شد
              </p>
            </div>

            {/* جعبه‌های کد */}
            <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  className={`w-11 h-14 text-center text-xl font-black border-2 rounded-md outline-none transition-all ${
                    error
                      ? "border-danger/60 bg-danger/5 text-danger"
                      : "border-border bg-bg-sec/50 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15"
                  }`}
                />
              ))}
            </div>

            {error && (
              <motion.div
                key={shake}
                animate={{ x: [0, -8, 8, -6, 6, 0] }}
                transition={{ duration: 0.4 }}
                className="text-xs font-bold text-danger bg-danger/10 border border-danger/20 rounded-lg p-3 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* شمارش معکوس / ارسال مجدد */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              {loading ? (
                <span className="flex items-center gap-1.5 font-bold text-primary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> در حال تایید…
                </span>
              ) : seconds > 0 ? (
                <span>
                  ارسال مجدد کد تا{" "}
                  <span className="font-bold text-text-strong">
                    {toFa(seconds)}
                  </span>{" "}
                  ثانیه دیگر
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendOtp()}
                  className="flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> ارسال مجدد کد
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ مرحله ۳: موفقیت ═══ */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
              className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="w-9 h-9 text-success" />
            </motion.div>
            <h3 className="text-base font-extrabold text-text-strong mb-1">
              ورود موفقیت‌آمیز بود!
            </h3>
            <p className="text-xs text-text-muted">در حال انتقال…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}