import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

/* ═══ هدر یکپارچه سکشن‌ها — موبایل‌اول، بدون شکستگی ═══ */
export default function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "مشاهده همه",
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 mb-5 md:mb-6 ${className}`}
    >
      {/* بلوک عنوان */}
      <div className="min-w-0">
        <h2 className="ns-section-title !mb-1">{title}</h2>
        {subtitle && (
          <p className="text-xs md:text-sm text-text-muted line-clamp-1 md:line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>

      {/* دکمه مشاهده — هرگز نمی‌شکنه */}
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-border bg-white text-[11px] md:text-xs font-bold text-text-muted hover:border-primary hover:text-primary-dark hover:bg-primary-lightest/30 transition"
        >
          {linkLabel}
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        </Link>
      )}
    </div>
  );
}