"use client";
import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

/* ═══ Newsletter Box — دام لید قبل از فوتر ═══ */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: value, source: "newsletter" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState("success");
        setMsg(data.duplicate ? "قبلاً عضو شدی! 🎉" : "عضویت با موفقیت ثبت شد!");
        setEmail("");
      } else {
        setState("error");
        setMsg(data?.message ?? "خطا؛ دوباره تلاش کن.");
      }
    } catch {
      setState("error");
      setMsg("خطا در ارتباط؛ دوباره تلاش کن.");
    }
  };

  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white">
      <div className="ns-container">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-amber-300" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-white">
            از تخفیف‌ها و پیشنهادهای ویژه باخبر شو
          </h2>
          <p className="text-sm md:text-base text-white/90 mb-6 leading-7">
            ایمیلت رو ثبت کن؛ هر هفته بهترین پیشنهادهای هتل، تور و پرواز رو
            مستقیم دریافت کن.
          </p>

          {state === "success" ? (
            <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span className="text-sm md:text-base font-bold">{msg}</span>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              {/* ✅ FIX: flex-1 فقط در ردیف دسکتاپ؛ در موبایل عرض کامل با ارتفاع ثابت */}
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="ایمیل خود را وارد کنید..."
                className="w-full sm:flex-1 h-14 rounded-lg bg-white/10 border border-white/25 backdrop-blur-sm px-5 text-base placeholder:text-white/50 outline-none focus:border-amber-300 focus:bg-white/15 transition"
              />
              <button
                type="submit"
                disabled={state === "loading" || !email.trim()}
                className="w-full sm:w-auto h-14 px-8 rounded-lg bg-amber-400 text-amber-950 font-extrabold text-base hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {state === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                عضویت
              </button>
            </form>
          )}

          {state === "error" && (
            <p className="mt-3 text-xs md:text-sm font-bold text-rose-300">{msg}</p>
          )}
        </div>
      </div>
    </section>
  );
}