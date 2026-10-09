"use client";
import { Stamp, CheckCircle2 } from "lucide-react";
import { useAccount, Skeleton, StatusBadge, EmptyState, faDate } from "@/components/account/ui";

const STEPS = [
  { key: "pending", label: "ثبت درخواست" },
  { key: "confirmed", label: "بررسی مدارک" },
  { key: "completed", label: "صدور ویزا" },
];

function VisaTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="text-xs font-bold text-danger bg-danger/10 rounded-lg px-3 py-2 inline-block">
        درخواست لغو شده است
      </div>
    );
  }
  const idx = STEPS.findIndex((s) => s.key === status);
  const active = idx === -1 ? 0 : idx;
  return (
    <div className="flex items-center gap-0 mt-4">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                i <= active
                  ? "bg-primary text-white"
                  : "bg-bg-sec text-text-subtle border border-border"
              }`}
            >
              {i < active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </span>
            <span
              className={`text-[10px] font-bold whitespace-nowrap ${
                i <= active ? "text-primary-dark" : "text-text-subtle"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${
                i < active ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function VisaPage() {
  const { data, loading } = useAccount<any>("bookings?type=visa");

  return (
    <div className="space-y-5">
      <h1 className="text-lg md:text-xl font-extrabold text-text-strong">درخواست‌های ویزا</h1>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
        </div>
      ) : data?.items?.length ? (
        <div className="space-y-4">
          {data.items.map((v: any) => (
            <div key={v.id} className="ns-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm md:text-base text-text-strong truncate">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1">
                    ثبت شده در {faDate(v.created_at)}
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <VisaTimeline status={v.status} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stamp}
          title="درخواست ویزایی نداری"
          desc="شرایط ویزای کشور مقصد رو ببین و درخواست بده"
          cta="مشاهده ویزاها"
          href="/visas"
        />
      )}
    </div>
  );
}