"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Sparkles,
  Home,
  Plane,
  PlaneTakeoff,
  BedDouble,
  Backpack,
  Stamp,
  MapPin,
  UtensilsCrossed,
  Newspaper,
  BookOpen,
  Stethoscope,
  ChevronDown,
  User,
  Phone,
  Mail,
  Compass,
  LogOut,
  UserCircle,
  CreditCard,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAuthModal } from "@/lib/auth/AuthModalProvider";
import UserAvatar from "@/components/ui/UserAvatar";

interface MobileMenuProps {
  items: MenuItem[];
  onAiTripClick?: () => void;
}

/* ═══════════════════════════════════════════════════════
   نگاشت آیکون: اول عنوان فارسی، بعد URL
═══════════════════════════════════════════════════════ */
function iconFor(url: string, title: string) {
  const t = (title || "").trim();
  const u = (url || "").toLowerCase();

  if (t.includes("فرودگاه")) return PlaneTakeoff;
  if (t.includes("بیمارستان")) return Stethoscope;
  if (t.includes("رستوران")) return UtensilsCrossed;
  if (t.includes("راهنما")) return BookOpen;
  if (t.includes("اخبار") || t.includes("خبر")) return Newspaper;
  if (t.includes("مقصد")) return MapPin;
  if (t.includes("ویزا")) return Stamp;
  if (t.includes("هتل")) return BedDouble;
  if (t.includes("پرواز")) return Plane;
  if (t.includes("تور")) return Backpack;

  if (u.startsWith("/airports")) return PlaneTakeoff;
  if (u.startsWith("/hospitals")) return Stethoscope;
  if (u.startsWith("/restaurants")) return UtensilsCrossed;
  if (u.startsWith("/travel-guides") || u.startsWith("/travelguide"))
    return BookOpen;
  if (u.startsWith("/travel-news") || u.startsWith("/news")) return Newspaper;
  if (u.startsWith("/destinations")) return MapPin;
  if (u.startsWith("/visa")) return Stamp;
  if (u.startsWith("/hotels")) return BedDouble;
  if (u.startsWith("/flights")) return Plane;
  if (u.startsWith("/tours")) return Backpack;
  if (u === "/" || u === "") return Home;

  return Compass;
}

const FALLBACK: MenuItem[] = [
  { id: 1, title: "صفحه اصلی", url: "/", children: [] },
  { id: 2, title: "پروازها", url: "/flights", children: [] },
  { id: 3, title: "هتل‌ها", url: "/hotels", children: [] },
  { id: 4, title: "تورها", url: "/tours", children: [] },
  { id: 5, title: "ویزا", url: "/visas", children: [] },
  { id: 6, title: "مقاصد گردشگری", url: "/destinations", children: [] },
  { id: 7, title: "راهنمای سفر", url: "/travel-guides", children: [] },
  { id: 8, title: "رستوران‌ها", url: "/restaurants", children: [] },
  { id: 9, title: "بیمارستان‌ها", url: "/hospitals", children: [] },
  { id: 10, title: "اخبار گردشگری", url: "/travel-news", children: [] },
  { id: 11, title: "فرودگاه‌ها", url: "/airports", children: [] },
];

/* ═══ ردیف منو با زیرمنوی آکاردئونی ═══ */
function MenuRow({
  item,
  onNavigate,
}: {
  item: MenuItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = iconFor(item.url, item.title);
  const kids = item.children ?? [];
  const hasKids = kids.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1">
        <Link
          href={item.url}
          onClick={onNavigate}
          className="flex flex-1 min-w-0 items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-white transition"
        >
          <span className="w-9 h-9 rounded-lg bg-white border border-border/60 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </span>
          <span className="flex-1 text-sm font-semibold text-text truncate">
            {item.title}
          </span>
        </Link>
        {hasKids && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`زیرمنوی ${item.title}`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-primary transition shrink-0 cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasKids && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="ms-6 ps-4 border-s-2 border-primary/25 space-y-0.5 py-1 mb-1">
              {kids.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.url}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-text-muted hover:bg-white hover:text-primary-dark transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MobileMenu({ items, onAiTripClick }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { open: openModal } = useAuthModal(); // ✅ FIX

  const menuItems = items.length > 0 ? items : FALLBACK;
  const handleClose = () => setOpen(false);
  const handleAiTripClick = () => {
    handleClose();
    onAiTripClick?.();
  };

  /* قفل اسکرول */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ESC */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* Back button مرورگر */
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ menuOpen: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  return (
    <>
      {/* ═══ دکمه همبرگر — فقط موبایل ═══ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-strong hover:bg-primary-lightest/50 transition cursor-pointer"
        aria-label="منو"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ═══ کشوی تمام‌عرض ═══ */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="منوی اصلی"
              className="fixed inset-y-0 end-0 z-[601] w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
            >
              {/* هدر کشو */}
              <div className="sticky top-0 bg-white border-b border-divider z-10">
                <div className="flex items-center justify-between px-4 h-14">
                  <h2 className="font-extrabold text-base text-text-strong">
                    منو
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-text-strong hover:bg-bg-sec transition cursor-pointer"
                    aria-label="بستن"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 pb-8 space-y-5">
                {/* ═══ وضعیت کاربر ═══ */}
                {user ? (
                  /* ✅ کاربر لاگین کرده → کارت پروفایل */
                  <div className="rounded-lg bg-gradient-to-br from-primary-lightest to-white border border-primary/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar
                        src={user.avatar}
                        className="w-12 h-12 ring-2 ring-white shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-text-strong truncate">
                          {user.display_name}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-text-muted truncate" dir="ltr">{user.phone}</div>
                        )}
                        {user.email && !user.phone && (
                          <div className="text-xs text-text-muted truncate" dir="ltr">{user.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5 pt-3 border-t border-primary/10">
                      <Link href="/account" onClick={handleClose}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-white transition">
                        <UserCircle className="w-4 h-4 text-primary" /> داشبورد
                      </Link>
                      <Link href="/account/bookings" onClick={handleClose}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-white transition">
                        <CreditCard className="w-4 h-4 text-primary" /> رزروهای من
                      </Link>
                      <Link href="/account/settings" onClick={handleClose}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text hover:bg-white transition">
                        <Settings className="w-4 h-4 text-primary" /> تنظیمات
                      </Link>
                      <button type="button"
                        onClick={async () => { await logout(); handleClose(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-white transition cursor-pointer">
                        <LogOut className="w-4 h-4" /> خروج
                      </button>
                    </div>
                  </div>
                ) : (
                  /* کاربر لاگین نکرده → دکمه ورود */
                  <button
                    type="button"
                    onClick={() => { handleClose(); openModal("phone"); }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-dark transition cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    ورود / ثبت‌نام
                  </button>
                )}

                {/* ✨ سفر هوشمند */}
                <button
                  type="button"
                  onClick={handleAiTripClick}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-primary-lightest border border-primary/25 hover:bg-primary-light/60 transition cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-primary-dark text-start">
                    برنامه سفر با AI
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                    جدید
                  </span>
                </button>

                {/* ═══ منوی وردپرس با آیکون‌ها ═══ */}
                <nav
                  className="rounded-lg bg-bg-sec/60 p-1.5"
                  aria-label="منوی موبایل"
                >
                  {menuItems.map((item) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      onNavigate={handleClose}
                    />
                  ))}
                </nav>

                {/* تماس */}
                <div className="pt-4 border-t border-divider">
                  <div className="space-y-2 text-sm text-text-muted">
                    <a
                      href="tel:02182801754"
                      dir="ltr"
                      className="flex items-center gap-2 hover:text-primary transition"
                    >
                      <Phone className="w-4 h-4" />
                      021-8280 1754
                    </a>
                    <a
                      href="mailto:info@nextsafar.com"
                      className="flex items-center gap-2 hover:text-primary transition"
                    >
                      <Mail className="w-4 h-4" />
                      info@nextsafar.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}