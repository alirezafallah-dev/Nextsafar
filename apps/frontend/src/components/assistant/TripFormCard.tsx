"use client";

import { useState } from "react";
import { ClipboardList, X } from "lucide-react";
import DestinationField from "@/components/ai-trip/DestinationField";
import { SingleDatePicker } from "@/components/search/fields";
import { BUDGET_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants/ai-trip";
import { generateTripPlan } from "@/lib/api/ai-trip";
import type { TripInput } from "@/types/ai-trip";

interface TripFormCardProps {
  onClose: () => void;
  onCreated: (planId: number) => void;
}

/**
 * ✅ فرم ساختاریافته ساخت برنامه — پشت دکمه، داخل دستیار
 */
export default function TripFormCard({ onClose, onCreated }: TripFormCardProps) {
  const [form, setForm] = useState<TripInput>({
    destination: "",
    country: "",
    days: 3,
    travelers: 2,
    start_date: null,
    budget_level: "medium",
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<TripInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setError("");
  };

  const toggleInterest = (item: string) => {
    const has = form.interests.includes(item);
    update({
      interests: has
        ? form.interests.filter((i) => i !== item)
        : form.interests.length < 5
          ? [...form.interests, item]
          : form.interests,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.destination.trim().length < 2) {
      setError("مقصد را مشخص کن");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await generateTripPlan(form);
      onCreated(res.plan_id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت برنامه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-divider bg-bg-sec/40 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs ">
          <ClipboardList className="w-4 h-4 text-primary" />
          ساخت برنامه با فرم
        </span>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-sec transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <DestinationField
        value={{ destination: form.destination, country: form.country }}
        onChange={(v) => update({ destination: v.destination, country: v.country })}
        placeholder="مقصد: مثلاً استانبول"
      />

      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-[10px] font-bold text-text-muted block mb-1">مدت</span>
          <select
            value={form.days}
            onChange={(e) => update({ days: Number(e.target.value) })}
            className="w-full ns-input text-xs"
          >
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((d) => (
              <option key={d} value={d}>{d} روز</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold text-text-muted block mb-1">بودجه</span>
          <select
            value={form.budget_level}
            onChange={(e) => update({ budget_level: e.target.value as TripInput["budget_level"] })}
            className="w-full ns-input text-xs"
          >
            {BUDGET_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold text-text-muted block mb-1">مسافران</span>
          <input
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={(e) => update({ travelers: Number(e.target.value) })}
            className="w-full ns-input text-xs"
          />
        </label>
      </div>

      <div>
        <span className="text-[10px] font-bold text-text-muted block mb-1.5">
          علاقه‌مندی‌ها (حداکثر ۵)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_OPTIONS.map((item) => {
            const selected = form.interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition cursor-pointer ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-muted hover:border-primary/50"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <SingleDatePicker
        value={form.start_date ?? undefined}
        onChange={(v) => update({ start_date: v ?? null })}
        label="تاریخ شروع (اختیاری)"
        placeholder="انتخاب کنید"
      />

      {error && (
        <p className="text-[11px] text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-gradient-to-l from-primary to-primary-dark text-white text-xs font-bold hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? "⏳ در حال ثبت..." : "✨ بساز برنامه‌مو"}
      </button>
    </form>
  );
}