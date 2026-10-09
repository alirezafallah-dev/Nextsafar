"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* ═══ هوک خواندن داده پنل ═══ */
export function useAccount<T = any>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/account/${path}`, { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) setError(d.error || "error");
      else setData(d);
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, loading, error, reload: load };
}

/* ═══ mutation (POST/DELETE) ═══ */
export async function accMutate(
  path: string,
  method: "POST" | "DELETE" = "POST",
  body?: any,
) {
  const isForm = body instanceof FormData;
  const r = await fetch(`/api/account/${path}`, {
    method,
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

/* ═══ بج وضعیت ═══ */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "در بررسی", cls: "bg-warning/10 text-warning" },
    confirmed: { label: "تایید شده", cls: "bg-success/10 text-success" },
    completed: { label: "تکمیل شده", cls: "bg-primary/10 text-primary-dark" },
    cancelled: { label: "لغو شده", cls: "bg-danger/10 text-danger" },
    refunded: { label: "بازگشت وجه", cls: "bg-bg-sec text-text-muted" },
  };
  const m = map[status] ?? { label: status, cls: "bg-bg-sec text-text-muted" };
  return <span className={`ns-badge ${m.cls}`}>{m.label}</span>;
}

/* ═══ حالت خالی ═══ */
export function EmptyState({
  icon: Icon,
  title,
  desc,
  cta,
  href,
}: {
  icon: any;
  title: string;
  desc: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="ns-card border-dashed !bg-bg-sec/30 p-10 text-center">
      <div className="w-14 h-14 rounded-full bg-primary-lightest flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-extrabold text-text-strong mb-1">{title}</h3>
      <p className="text-xs text-text-muted mb-4">{desc}</p>
      {cta && href && (
        <Link href={href} className="ns-btn ns-btn-primary !py-2.5">
          {cta}
        </Link>
      )}
    </div>
  );
}

/* ═══ اسکلتون ═══ */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-bg-sec rounded-lg ${className}`} />;
}

/* ═══ تاریخ فارسی ═══ */
export function faDate(d: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

/* ═══ مبلغ فارسی ═══ */
export function faMoney(n: number | string | null) {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("fa-IR").format(v) + " تومان";
}