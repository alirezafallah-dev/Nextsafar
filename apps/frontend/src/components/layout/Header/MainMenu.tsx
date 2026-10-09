"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { MenuItem } from "@/types/menu";

interface MainMenuProps {
  items: MenuItem[];
  variant?: "primary" | "secondary";
  onAiTripClick?: () => void; // ✅ پروپ جدید
}

export default function MainMenu({ items, variant = "primary", onAiTripClick }: MainMenuProps) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url || pathname?.startsWith(url + "/");

  return (
    <nav className="flex items-center gap-1">
      {/* آیتم‌های منوی اصلی */}
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            isActive(item.url)
              ? "text-primary-dark"
              : "text-text-muted hover:text-primary-dark hover:bg-primary-lightest/50"
          }`}
        >
          {item.title}
        </Link>
      ))}

      {/* ✅ تب جدید: سفر هوشمند */}
      <button
        type="button"
        onClick={onAiTripClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          pathname === "/ai-trip"
            ? "text-primary-dark"
            : "text-text-muted hover:text-primary-dark hover:bg-primary-lightest/50"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>سفر هوشمند</span>
      </button>
    </nav>
  );
}