import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: LogoProps) {
  // سایزهای مختلف لوگو بر اساس حالت هدر
  const sizes = {
    sm: { height: 38, width: 140 }, // بعد از اسکرول (کوچک‌تر)
    md: { height: 48, width: 160 }, // حالت عادی
    lg: { height: 56, width: 200 }, // برای صفحات بزرگ
  };

  const s = sizes[size];

  return (
    <Link
      href="/"
      className="flex items-center gap-3 group"
      aria-label="نکست سفر - صفحه اصلی"
    >
      <Image
        src="/images/logo.png"
        alt="نکست سفر"
        width={s.height}
        height={s.height}
        priority
        className="object-contain transition-all"
        style={{ maxHeight: `${s.height}px` }}
      />
      <div className="flex flex-col leading-tight hidden sm:flex gap-1">
        <span className="text-lg font-bold text-text-strong group-hover:text-primary-600 transition-colors">
          سفر بعدی ایرانیان
        </span>
        <span className="text-xs text-text-muted">Next Safar Iranian</span>
      </div>
    </Link>
  );
}
