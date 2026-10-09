"use client";
import { useState } from "react";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";

/* ═══ بند Lead-Capture: هشدار کاهش قیمت ═══ */
export default function LeadCaptureBand() {
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = contact.trim();
    if (!value || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: value }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState("success");
        setMsg(
          data.duplicate
            ? "این ایمیل/شماره قبلاً ثبت شده؛ خیالت راحت!"
            : "ثبت شد! اولین نفری باش که از افت قیمت‌ها باخبر می‌شه.",
        );
        setContact("");
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
    <section className="ns-container py-8 md:py-12">
      <div className="relative overflow-hidden rounded-lg md:rounded-[16px] bg-gradient-to-l from-[#0b1e3a] via-[#123a6b] to-[#0b1e3a] p-6 md:p-8 text-white">
        {/* دکور */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -start-20 w-72 h-72 bg-amber-300 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -end-16 w-80 h-80 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          {/* متن */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-9 h-9 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-amber-300" />
              </span>
              <span className="text-xs font-bold text-amber-200">هشدار کاهش قیمت</span>
            </div>
            <h2 className="text-lg md:text-2xl text-white font-extrabold mb-1.5">
              قیمت‌ها پایین اومد، اول تو باخبر شو
            </h2>
            <p className="text-xs md:text-sm text-white/80 leading-6">
              ایمیل یا شماره موبایلت رو ثبت کن؛ وقتی قیمت هتل‌ها و تورهای مقصدت افت
              کرد، آنی بهت خبر می‌دیم.
            </p>
          </div>

          {/* فرم / پیام موفقیت */}
          {state === "success" ? (
            <div className="flex items-center gap-2 w-full md:w-auto px-5 py-4 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs md:text-sm font-bold leading-6">{msg}</span>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[420px]"
            >
              <input
                type="text"
                inputMode="email"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="ایمیل یا شماره موبایل (مثلاً ۰۹۱۲...)"
                className="w-full sm:flex-1 h-14 rounded-lg bg-white/10 border border-white/25 backdrop-blur-sm px-4 text-base placeholder:text-white/50 outline-none focus:border-amber-300 focus:bg-white/15 transition"
              />
              <button
                type="submit"
                disabled={state === "loading" || !contact.trim()}
                className="w-full sm:w-auto h-14 px-8 rounded-lg bg-amber-400 text-amber-950 font-extrabold text-base hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {state === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <BellRing className="w-5 h-5" />
                )}
                ثبت هشدار
              </button>
            </form>
          )}
        </div>

        {state === "error" && (
          <p className="relative z-10 mt-3 text-[11px] md:text-xs font-bold text-rose-300">
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}