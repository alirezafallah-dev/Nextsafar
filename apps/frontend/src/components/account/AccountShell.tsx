"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Stamp,
  Heart,
  Wallet,
  Settings,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import type { AuthUser } from "@/lib/auth/session";

const ITEMS = [
  { href: "/account", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/account/bookings", label: "رزروها", icon: CreditCard },
  { href: "/account/visa", label: "درخواست‌های ویزا", icon: Stamp },
  { href: "/account/favorites", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/account/wallet", label: "کیف پول و واریزی‌ها", icon: Wallet },
  { href: "/account/settings", label: "تنظیمات", icon: Settings },
];

export default function AccountShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (it: (typeof ITEMS)[number]) =>
    it.exact ? pathname === it.href : pathname.startsWith(it.href);

  return (
    <div className="ns-container ns-account py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ سایدبار دسکتاپ ═══ */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="ns-card p-4 sticky top-24">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-divider">
              <UserAvatar
                src={user.avatar}
                className="w-11 h-11 ring-2 ring-primary/20"
              />
              <div className="min-w-0">
                <div className="font-bold text-sm text-text-strong truncate">
                  {user.display_name}
                </div>
                <div className="text-[11px] text-text-muted truncate" dir="ltr">
                  {user.phone || user.email || ""}
                </div>
              </div>
            </div>
            <nav className="space-y-1">
              {ITEMS.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition ${
                    isActive(it)
                      ? "bg-primary-lightest text-primary-dark"
                      : "text-text-muted hover:bg-bg-sec hover:text-text-strong"
                  }`}
                >
                  <it.icon className="w-4 h-4 shrink-0" />
                  {it.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ═══ تب‌های موبایل ═══ */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  isActive(it)
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-border text-text-muted"
                }`}
              >
                <it.icon className="w-3.5 h-3.5" />
                {it.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ محتوا ═══ */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}