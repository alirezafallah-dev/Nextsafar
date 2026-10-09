import {
  BedDouble,
  MapPin,
  Backpack,
  Stamp,
  BookOpen,
  Headphones,
} from "lucide-react";
import { getSiteStats } from "@/lib/api/stats";
import CountUp from "./CountUp";

export default async function StatsBar() {
  const s = await getSiteStats();

  /* ❌ بدون فیلتر — همه ۶ سلول همیشه نمایش داده می‌شن */
  const items = [
    { icon: BedDouble, value: s.hotel ?? 0, label: "هتل و اقامتگاه" },
    { icon: MapPin, value: s.destination ?? 0, label: "مقصد گردشگری" },
    { icon: Backpack, value: s.tour ?? 0, label: "تور فعال" },
    { icon: Stamp, value: s.visa ?? 0, label: "خدمات ویزا" },
    { icon: BookOpen, value: s.travelguide ?? 0, label: "راهنمای سفر" },
    { icon: Headphones, value: -1, label: "پشتیبانی ۲۴/۷" },
  ];

  return (
    <section className="ns-container py-8 md:py-12">
      {/* ✅ Radius توکن: موبایل 12px / دسکتاپ 16px */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-lg md:rounded-[16px] overflow-hidden border border-border shadow-sm">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white p-3 md:p-6 text-center hover:bg-primary-lightest/40 transition-colors duration-200"
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1.5 md:mb-2" />
              <div className="text-lg md:text-2xl font-extrabold text-text-strong tracking-tight">
                {item.value === -1 ? (
                  <span dir="ltr">۲۴/۷</span>
                ) : item.value > 0 ? (
                  <span dir="ltr" className="inline-flex items-center">
                    +<CountUp value={item.value} />
                  </span>
                ) : (
                  <span className="text-text-subtle">—</span>
                )}
              </div>
              <div className="text-[10px] md:text-xs text-text-muted mt-1 font-medium leading-4">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}