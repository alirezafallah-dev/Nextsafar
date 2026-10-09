"use client";
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "@/lib/auth/AuthModalProvider";
import PhoneLoginForm from "./PhoneLoginForm";

const LOGO_SRC = "/images/logo.png";

export default function AuthModal() {
  const { isOpen, close } = useAuthModal();

  /* هندلر بستن مطمئن */
  const handleClose = useCallback(() => {
    close();
    document.body.style.overflow = "";
  }, [close]);

  /* قفل اسکرول */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ESC */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-modal border border-border overflow-hidden pointer-events-auto">
              {/* دکمه بستن */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute top-4 end-4 z-30 p-2 rounded-full text-white/85 hover:bg-white/15 hover:text-white transition cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ═══ هدر گرادیان برند ═══ */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-dark px-6 pt-6 pb-6 text-white">
                {/* دایره‌های تزئینی — بدون مزاحمت کلیک */}
                <div className="pointer-events-none absolute -top-12 -start-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 -end-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />

                {/* ✅ فقط تصویر لوگو — بدون وابستگی به کامپوننت هدر */}
                <div className="relative flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center p-2.5 shadow-md shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={LOGO_SRC}
                      alt="سفر بعدی"
                      draggable={false}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">خوش آمدید!</h2>
                    <p className="text-xs text-white/85 mt-0.5">
                      وارد شو یا در چند ثانیه حساب بساز
                    </p>
                  </div>
                </div>
              </div>

              {/* ═══ بدنه فرم ═══ */}
              <div className="p-6">
                <PhoneLoginForm onSuccess={handleClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}