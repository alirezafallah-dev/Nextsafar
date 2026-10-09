"use client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { UserCircle, CreditCard, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="ns-container py-12 text-center">
        <p className="text-text-muted">لطفاً وارد شوید</p>
      </div>
    );
  }

  return (
    <div className="ns-container py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold text-text-strong mb-6">
        داشبورد
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-white p-6">
          <UserCircle className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-text-strong mb-1">پروفایل</h3>
          <p className="text-sm text-text-muted mb-3">
            {user.display_name}
            {user.email && <span dir="ltr"> • {user.email}</span>}
          </p>
          <Link
            href="/account/settings"
            className="text-sm text-primary font-bold hover:underline"
          >
            ویرایش پروفایل
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          <CreditCard className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-text-strong mb-1">رزروهای من</h3>
          <p className="text-sm text-text-muted mb-3">
            هنوز رزروی ثبت نشده است
          </p>
          <Link
            href="/account/bookings"
            className="text-sm text-primary font-bold hover:underline"
          >
            مشاهده رزروها
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-white p-6">
          <Settings className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-text-strong mb-1">تنظیمات</h3>
          <p className="text-sm text-text-muted mb-3">
            تنظیمات حساب کاربری
          </p>
          <Link
            href="/account/settings"
            className="text-sm text-primary font-bold hover:underline"
          >
            رفتن به تنظیمات
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-danger text-white font-bold text-sm hover:bg-danger/90 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}