"use client";
import Link from "next/link";
import { CreditCard, Heart, Wallet, ArrowLeft } from "lucide-react";
import { useAccount, Skeleton, StatusBadge, EmptyState, faDate, faMoney } from "@/components/account/ui";

export default function AccountDashboard() {
  const { data, loading } = useAccount<any>("overview");

  const stats = [
    { icon: CreditCard, label: "رزرو فعال", value: data?.active ?? 0, href: "/account/bookings" },
    { icon: Heart, label: "علاقه‌مندی", value: data?.favorites ?? 0, href: "/account/favorites" },
    { icon: Wallet, label: "موجودی کیف پول", value: data ? faMoney(data.balance) : "—", href: "/account/wallet" },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ تیتر: حداکثر text-xl (۱.۲۵rem) */}
      <h1 className="text-lg md:text-xl font-extrabold text-text-strong">داشبورد</h1>

      {/* آمار — بدون transform در hover */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="ns-card p-5 hover:border-primary-light hover:shadow-card-hover transition-[border-color,box-shadow] group">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-lg bg-primary-lightest text-primary flex items-center justify-center">
                <s.icon className="w-5 h-5" />
              </span>
              <ArrowLeft className="w-4 h-4 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-base md:text-lg font-extrabold text-text-strong">{s.value}</div>
            )}
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* آخرین رزروها */}
      <div>
        <h2 className="text-base md:text-lg font-extrabold text-text-strong mb-3">آخرین رزروها</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : data?.recent?.length ? (
          <div className="space-y-3">
            {data.recent.map((b: any) => (
              <div key={b.id} className="ns-card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-text-strong truncate">{b.title}</div>
                  <div className="text-[11px] text-text-muted mt-1">{faDate(b.created_at)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {b.amount ? <span className="text-xs font-bold text-text-muted">{faMoney(b.amount)}</span> : null}
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="هنوز رزروی نداری"
            desc="اولین رزرو خودت رو ثبت کن و اینجا پیگیریش کن"
            cta="مشاهده هتل‌ها"
            href="/hotels"
          />
        )}
      </div>
    </div>
  );
}