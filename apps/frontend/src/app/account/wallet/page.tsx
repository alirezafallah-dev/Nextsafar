"use client";
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { useAccount, Skeleton, EmptyState, faDate, faMoney } from "@/components/account/ui";

const TYPE_META: Record<string, { label: string; icon: any; sign: string; cls: string }> = {
  deposit: { label: "واریز", icon: ArrowDownLeft, sign: "+", cls: "text-success" },
  payment: { label: "پرداخت", icon: ArrowUpRight, sign: "-", cls: "text-danger" },
  refund: { label: "بازگشت وجه", icon: RefreshCw, sign: "+", cls: "text-success" },
};

export default function WalletPage() {
  const overview = useAccount<any>("overview");
  const { data, loading } = useAccount<any>("transactions");

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-xl font-extrabold text-text-strong">کیف پول و واریزی‌ها</h1>

      {/* کارت موجودی — عدد هم کوچک‌تر */}
      <div className="rounded-lg bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white p-6 shadow-card-hover">
        <div className="flex items-center gap-2 text-white/85 text-xs font-bold mb-2">
          <Wallet className="w-4 h-4" />
          موجودی کیف پول
        </div>
        {overview.loading ? (
          <div className="h-9 w-40 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <div className="text-xl md:text-2xl font-extrabold">
            {faMoney(overview.data?.balance ?? 0)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base md:text-lg font-extrabold text-text-strong mb-3">تاریخچه تراکنش‌ها</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : data?.items?.length ? (
          <div className="ns-card divide-y divide-divider">
            {data.items.map((t: any) => {
              const m = TYPE_META[t.type] ?? TYPE_META.payment;
              return (
                <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-bg-sec flex items-center justify-center shrink-0">
                      <m.icon className={`w-4 h-4 ${m.cls}`} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-text-strong">
                        {t.description || m.label}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {faDate(t.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-extrabold shrink-0 ${m.cls}`} dir="ltr">
                    {m.sign}
                    {new Intl.NumberFormat("fa-IR").format(Math.abs(Number(t.amount)))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="تراکنشی ثبت نشده"
            desc="واریزی‌ها و پرداخت‌های تو اینجا نمایش داده می‌شن"
          />
        )}
      </div>
    </div>
  );
}