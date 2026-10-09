import Link from "next/link";
import { getMenus } from "@/lib/api/menu";

export default async function MenuColumns() {
  /* ✅ از endpoint واقعی بگیر — نه هاردکد */
  const secMenu = await getMenus("secmenu");

  /* گروه‌بندی بر اساس parent یا دسته‌بندی منطقی */
  const groups = [
    {
      title: "دسترسی سریع",
      items: secMenu.filter((item) =>
        ["/tours", "/hotels", "/flights", "/visas", "/travel-news"].includes(item.url),
      ),
    },
    {
      title: "پشتیبانی",
      items: secMenu.filter((item) =>
        ["/contact", "/faq", "/refund-policy", "/privacy-policy", "/terms"].includes(item.url),
      ),
    },
    {
      title: "راهنما",
      items: secMenu.filter((item) =>
        ["/about", "/how-to-book", "/support", "/careers"].includes(item.url),
      ),
    },
  ];

  /* ✅ فال‌بک اگه endpoint خالی بود */
  const fallbackGroups = [
    {
      title: "دسترسی سریع",
      items: [
        { id: 1, title: "تورها", url: "/tours" },
        { id: 2, title: "هتل‌ها", url: "/hotels" },
        { id: 3, title: "پروازها", url: "/flights" },
        { id: 4, title: "ویزا", url: "/visas" },
        { id: 5, title: "اخبار و مقالات", url: "/travel-news" },
      ],
    },
    {
      title: "پشتیبانی",
      items: [
        { id: 6, title: "تماس با ما", url: "/contact" },
        { id: 7, title: "سوالات متداول", url: "/faq" },
        { id: 8, title: "بازگشت وجه", url: "/refund-policy" },
        { id: 9, title: "حریم خصوصی", url: "/privacy-policy" },
        { id: 10, title: "شرایط استفاده", url: "/terms" },
      ],
    },
    {
      title: "راهنما",
      items: [
        { id: 11, title: "درباره ما", url: "/about" },
        { id: 12, title: "راهنمای رزرو", url: "/how-to-book" },
        { id: 13, title: "پشتیبانی", url: "/support" },
        { id: 14, title: "فرصت‌های شغلی", url: "/careers" },
      ],
    },
  ];

  const displayGroups = groups.every((g) => g.items.length === 0)
    ? fallbackGroups
    : groups;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {displayGroups.map((section, idx) => (
        <div key={idx}>
          <h3 className="sfp3-head text-base mb-3">{section.title}</h3>
          <ul className="space-y-2.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="text-sm text-text hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}