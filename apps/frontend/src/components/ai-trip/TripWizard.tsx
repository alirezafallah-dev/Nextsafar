"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import DestinationField from "./DestinationField";
import { formatNumber } from "@/lib/utils";
import { BUDGET_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants/ai-trip";
import type { TripInput } from "@/types/ai-trip";

const STEPS = [
  { id: 1, label: "مقصد", icon: MapPin },
  { id: 2, label: "زمان‌بندی", icon: CalendarDays },
  { id: 3, label: "بودجه", icon: Wallet },
  { id: 4, label: "علاقه‌مندی‌ها", icon: Heart },
  { id: 5, label: "تأیید نهایی", icon: CheckCircle2 },
];

export default function TripWizard({
  initial,
  onSubmit,
  loading,
  embedded = false,
}: {
  initial: TripInput;
  onSubmit: (input: TripInput) => void;
  loading?: boolean;
  embedded?: boolean;
}) {
  const [step, setStep] = useState(initial.destination.trim() ? 2 : 1);
  const [form, setForm] = useState<TripInput>(initial);
  const [error, setError] = useState("");

  const update = (patch: Partial<TripInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setError("");
  };

  /* ─── اعتبارسنجی هر مرحله ─── */
  const validate = (s: number): string => {
    if (s === 1 && form.destination.trim().length < 2)
      return "لطفاً مقصد رو مشخص کن";
    if (s === 2 && (form.days < 2 || form.days > 14))
      return "مدت سفر باید بین ۲ تا ۱۴ روز باشه";
    if (s === 4 && form.interests.length === 0)
      return "حداقل یک علاقه‌مندی انتخاب کن";
    if (s === 4 && form.interests.length > 5)
      return "حداکثر ۵ علاقه‌مندی انتخاب کن";
    return "";
  };

  const next = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    if (step === 5) {
      onSubmit(form);
    } else {
      setStep(step + 1);
    }
  };

  const back = () => step > 1 && setStep(step - 1);

  const toggleInterest = (item: string) => {
    const has = form.interests.includes(item);
    if (has) {
      update({ interests: form.interests.filter((i) => i !== item) });
    } else if (form.interests.length < 5) {
      update({ interests: [...form.interests, item] });
    }
  };

  return (
    <div className={embedded ? "overflow-hidden" : "ns-card overflow-hidden"}>
      {/* ═══ نوار پیشرفت ═══ */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => done && setStep(s.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      done
                        ? "bg-primary border-primary text-white cursor-pointer"
                        : active
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-bg-sec border-border text-text-muted"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4.5 h-4.5 w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-[10px] md:text-[11px] font-bold whitespace-nowrap ${
                      active
                        ? "text-primary"
                        : done
                          ? "text-text-strong"
                          : "text-text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 md:mx-2 mb-5 rounded transition-colors duration-500 ${
                      done ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* ═══ مرحله ۱: مقصد ═══ */}
        {step === 1 && (
          <div>
            <h3 className=" text-lg mb-1">📍 کجا می‌خوای بری؟</h3>
            <p className="text-sm text-text-muted mb-5">
              اسم شهر یا کشور رو بنویس تا از پیشنهادهای سایت انتخاب کنی
            </p>
            <DestinationField
              value={{ destination: form.destination, country: form.country }}
              onChange={(v) =>
                update({ destination: v.destination, country: v.country })
              }
            />
          </div>
        )}

        {/* ═══ مرحله ۲: زمان‌بندی ═══ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className=" text-lg mb-1">
                🗓️ چند روز سفر می‌کنی؟
              </h3>
              <p className="text-sm text-text-muted mb-4">بین ۲ تا ۱۴ روز</p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={2}
                  max={14}
                  value={form.days}
                  onChange={(e) => update({ days: Number(e.target.value) })}
                  className="flex-1 accent-[var(--color-primary,#2563eb)]"
                />
                <span className="text-2xl  text-primary min-w-20 text-center">
                  {formatNumber(form.days)} روز
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* تعداد مسافر */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  تعداد مسافر
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      update({ travelers: Math.max(1, form.travelers - 1) })
                    }
                    className="w-8 h-8 rounded-lg bg-bg-sec hover:bg-primary hover:text-white flex items-center justify-center transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center ">
                    {formatNumber(form.travelers)} نفر
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update({ travelers: Math.min(20, form.travelers + 1) })
                    }
                    className="w-8 h-8 rounded-lg bg-bg-sec hover:bg-primary hover:text-white flex items-center justify-center transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* تاریخ شروع */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  تاریخ شروع{" "}
                  <span className="text-text-muted font-normal">(اختیاری)</span>
                </label>
                <input
                  type="date"
                  value={form.start_date ?? ""}
                  onChange={(e) =>
                    update({ start_date: e.target.value || null })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ مرحله ۳: بودجه ═══ */}
        {step === 3 && (
          <div>
            <h3 className=" text-lg mb-1">
              💳 سطح بودجه‌ت چقدره؟
            </h3>
            <p className="text-sm text-text-muted mb-5">
              برنامه سفر بر اساس بودجه‌ت شخصی‌سازی می‌شه
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ budget_level: opt.value })}
                  className={`p-5 rounded-lg border-2 text-start transition-all duration-300 ${
                    form.budget_level === opt.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.emoji}</div>
                  <div className=" mb-1">{opt.label}</div>
                  <div className="text-xs text-text-muted">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ مرحله ۴: علاقه‌مندی‌ها ═══ */}
        {step === 4 && (
          <div>
            <h3 className=" text-lg mb-1">
              ❤️ چه چیزایی دوست داری؟
            </h3>
            <p className="text-sm text-text-muted mb-5">
              بین ۱ تا ۵ مورد انتخاب کن —{" "}
              <span className="font-bold text-primary">
                {formatNumber(form.interests.length)} از ۵
              </span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {INTEREST_OPTIONS.map((item) => {
                const selected = form.interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      selected
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-border bg-white text-text-muted hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ مرحله ۵: تأیید ═══ */}
        {step === 5 && (
          <div>
            <h3 className=" text-lg mb-1">✅ همه‌چیز درسته؟</h3>
            <p className="text-sm text-text-muted mb-5">
              یه نگاه بنداز و بعد بسپارش به هوش مصنوعی
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  label: "مقصد",
                  value: `${form.destination}${form.country ? "، " + form.country : ""}`,
                },
                { label: "مدت سفر", value: `${form.days} روز` },
                { label: "مسافران", value: `${form.travelers} نفر` },
                {
                  label: "تاریخ شروع",
                  value: form.start_date || "هنوز مشخص نیست",
                },
                {
                  label: "بودجه",
                  value:
                    BUDGET_OPTIONS.find((b) => b.value === form.budget_level)
                      ?.label || "",
                },
                { label: "علاقه‌مندی‌ها", value: form.interests.join("، ") },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-sec/50 border border-border"
                >
                  <span className="text-xs text-text-muted">{row.label}</span>
                  <span className="text-sm font-bold text-text-strong">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-text-muted bg-primary/5 border border-primary/20 rounded-lg p-3">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                ساخت برنامه حدود ۳۰ تا ۶۰ ثانیه طول می‌کشه. سهمیه رایگان: ۳
                برنامه در روز
              </span>
            </div>
          </div>
        )}

        {/* ═══ خطا ═══ */}
        {error && (
          <div className="mt-4 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* ═══ دکمه‌های ناوبری ═══ */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1 px-5 py-3 rounded-lg border border-border text-sm font-bold text-text-muted hover:bg-bg-sec transition"
            >
              <ChevronRight className="w-4 h-4" />
              قبلی
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={next}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-l from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:opacity-95 transition disabled:opacity-50"
          >
            {step === 5 ? (
              <>
                <Sparkles className="w-4 h-4" />
                بساز برنامه‌مو!
              </>
            ) : (
              <>
                بعدی
                <ChevronLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
