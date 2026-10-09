"use client";
import { useState, useRef, useEffect } from "react";
import {
  User,
  UserCircle,
  Settings,
  LogOut,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAuthModal } from "@/lib/auth/AuthModalProvider";
import UserAvatar from "@/components/ui/UserAvatar";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { open: openModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ═══ حالت مهمان ═══ */
  if (!user) {
    return (
      <>
        {/* موبایل: آیکون User در دایره */}
        <button
          type="button"
          onClick={() => openModal("phone")}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-bg-sec text-text-strong hover:bg-primary-lightest hover:text-primary-dark transition cursor-pointer"
          aria-label="ورود"
        >
          <User className="w-5 h-5" />
        </button>

        {/* دسکتاپ: دکمه با متن */}
        <button
          type="button"
          onClick={() => openModal("phone")}
          className="hidden md:flex ns-btn ns-btn-primary !px-4 !py-2.5 cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>ورود / ثبت‌نام</span>
        </button>
      </>
    );
  }

  /* ═══ حالت لاگین — آواتار + نام + فلش ═══ */
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer group"
        aria-label="منوی کاربری"
        aria-expanded={open}
      >
        {/* ✅ آواتار: عکس کاربر یا پیش‌فرض برند */}
        <UserAvatar
          src={user.avatar}
          className="w-9 h-9 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-sm"
        />

        {/* نام + فلش (فقط دسکتاپ) */}
        <div className="hidden md:flex items-center gap-1">
          <span className="text-sm font-bold text-text-strong max-w-[120px] truncate">
            {user.display_name}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* ═══ دراپ‌داون پروفایل ═══ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full end-0 mt-2 w-72 bg-white rounded-xl shadow-modal border border-border overflow-hidden z-50"
          >
            {/* هدر پروفایل */}
            <div className="p-4 border-b border-divider bg-gradient-to-br from-primary-lightest to-white">
              <div className="flex items-center gap-3">
                {/* ✅ آواتار بزرگ‌تر در هدر دراپ‌داون */}
                <UserAvatar
                  src={user.avatar}
                  className="w-12 h-12 ring-2 ring-white shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-text-strong truncate">
                    {user.display_name}
                  </div>
                  {user.phone && (
                    <div className="text-xs text-text-muted truncate" dir="ltr">
                      {user.phone}
                    </div>
                  )}
                  {user.email && !user.phone && (
                    <div className="text-xs text-text-muted truncate" dir="ltr">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* منوی پروفایل */}
            <ul className="py-1.5">
              <li>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-lightest hover:text-primary-dark transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-primary" />
                  داشبورد
                </Link>
              </li>
              <li>
                <Link
                  href="/account/bookings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-lightest hover:text-primary-dark transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-primary" />
                  رزروهای من
                </Link>
              </li>
              <li>
                <Link
                  href="/account/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-lightest hover:text-primary-dark transition-colors"
                >
                  <Settings className="w-4 h-4 text-primary" />
                  تنظیمات
                </Link>
              </li>
              <li className="border-t border-divider mt-1 pt-1">
                <button
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}