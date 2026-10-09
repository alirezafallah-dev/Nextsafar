"use client";
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useAccount, Skeleton, StatusBadge, EmptyState, faDate, faMoney } from "@/components/account/ui";

const TABS = [
  { key: "", label: "همه" },
  { key: "hotel", label: "هتل" },
  { key: "tour", label: "تور" },
  { key: "flight", label: "پرواز" },
];

const TYPE_FA: Record<string, string> = {
  hotel: "هتل", tour: "تور", flight: "پرواز", visa: "ویزا",
};

export default function BookingsPage() {
  const [tab, setTab] = useState("");
  const { data, loading } = useAccount<any>(`bookings${tab ? `?type=${tab}` : ""}`);

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-extrabold text-text-strong">رزروها</h1>

      {/* تب‌ها */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === t.key
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-text-muted hover:text-text-strong"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : data?.items?.length ? (
        <div className="space-y-3">
          {data.items.map((b: any) => (
            <div key={b.id} className="ns-card p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm md:text-base text-text-strong truncate">
                    {b.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1.5">
                    <span className="ns-badge bg-bg-sec text-text-muted">
                      {TYPE_FA[b.type] ?? b.type}
                    </span>
                    <span>{faDate(b.created_at)}</span>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.amount ? (
                <div className="pt-3 border-t border-divider flex items-center justify-between">
                  <span className="text-xs text-text-muted">مبلغ پرداختی</span>
                  <span className="text-sm font-extrabold text-primary-dark">
                    {faMoney(b.amount)}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="رزروی در این دسته نیست"
          desc="وقتی رزروی ثبت کنی اینجا نمایش داده می‌شه"
          cta="مشاهده خدمات"
          href="/hotels"
        />
      )}
    </div>
  );
}