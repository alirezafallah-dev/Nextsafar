"use client";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import MainMenu from "./MainMenu";
import HeaderSearch from "./HeaderSearch";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import AssistantDrawer from "@/components/assistant/AssistantDrawer";
import { MenuItem } from "@/types/menu";

interface HeaderProps {
  mainMenuItems: MenuItem[];
  secMenuItems: MenuItem[];
  mobileMenuItems?: MenuItem[];
}

export default function Header({
  mainMenuItems,
  secMenuItems,
  mobileMenuItems = [],
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  /* ═══ ✅ منوی دوم: فقط بعد از ۲۶۰px اسکرول + فقط دسکتاپ ═══ */
  const showSecondRow = scrolled && secMenuItems.length > 0 && !isMobile;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ═══ تشخیص موبایل (زیر 1024px = موبایل/تبلت کوچک) ═══ */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleAiTripClick = () => setShowAssistant(true);
  const handleCloseModal = () => setShowAssistant(false);

  return (
    <>
      <header className="sticky top-3 z-50">
        <div className="max-w-[1280px] mx-auto ns-container">
          {/* ═══ سطر اول: هدر اصلی ═══ */}
          <div
            className={`border border-border bg-white transition-all duration-300 ${
              showSecondRow ? "rounded-t-lg rounded-b-none" : "rounded-lg"
            }`}
          >
            <div className="container px-4">
              <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4">
                {/* راست: لوگو */}
                <div className="flex-shrink-0">
                  <Logo size={scrolled ? "sm" : "md"} />
                </div>

                {/* وسط: منوی اصلی (فقط دسکتاپ) */}
                <div
                  className={`hidden lg:flex flex-1 transition-all duration-300 ${
                    scrolled ? "justify-start" : "justify-center"
                  }`}
                >
                  <MainMenu
                    items={mainMenuItems}
                    variant="primary"
                    onAiTripClick={handleAiTripClick}
                  />
                </div>

                {/* چپ: جستجو + کاربر + منوی موبایل */}
                <div className="flex items-center gap-2">
                  {/* ✅ دسکتاپ: باکس فقط بعد اسکرول / موبایل: آیکون همیشه */}
                  <HeaderSearch desktopBoxVisible={scrolled} />
                  <UserMenu />
                  <MobileMenu
                    items={
                      mobileMenuItems.length > 0 ? mobileMenuItems : mainMenuItems
                    }
                    onAiTripClick={handleAiTripClick}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ✅ سطر دوم: منوی دسته‌ها — فقط دسکتاپ، بعد از ۲۶۰px ═══ */}
          {showSecondRow && (
            <div className="border border-t-0 border-border bg-surface rounded-b-lg">
              <div className="container px-4">
                <nav className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
                  {secMenuItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      className="px-3 py-1.5 rounded-md text-sm font-medium text-text-muted hover:text-primary-dark hover:bg-primary-lightest transition-colors whitespace-nowrap"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {showAssistant && <AssistantDrawer onClose={handleCloseModal} />}
    </>
  );
}