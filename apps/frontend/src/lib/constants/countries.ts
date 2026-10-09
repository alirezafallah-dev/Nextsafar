/* ═══════════════════════════════════════════════════════════
   نگاشت کشورها: فارسی (متای وردپرس) → انگلیسی (world-atlas) + پرچم
═══════════════════════════════════════════════════════════ */
export interface CountryInfo {
  en: string;
  iso: string;
  flag: string;
}

export const COUNTRY_MAP: Record<string, CountryInfo> = {
  ترکیه: { en: "Turkey", iso: "TUR", flag: "🇹" },
  امارات: { en: "United Arab Emirates", iso: "ARE", flag: "🇦🇪" },
  "امارات متحده عربی": { en: "United Arab Emirates", iso: "ARE", flag: "🇦🇪" },
  گرجستان: { en: "Georgia", iso: "GEO", flag: "🇬🇪" },
  ایران: { en: "Iran", iso: "IRN", flag: "🇮🇷" },
  آذربایجان: { en: "Azerbaijan", iso: "AZE", flag: "🇦🇿" },
  ارمنستان: { en: "Armenia", iso: "ARM", flag: "🇦🇲" },
  روسیه: { en: "Russia", iso: "RUS", flag: "🇷🇺" },
  تایلند: { en: "Thailand", iso: "THA", flag: "🇹🇭" },
  مالزی: { en: "Malaysia", iso: "MYS", flag: "🇲🇾" },
  هند: { en: "India", iso: "IND", flag: "🇮🇳" },
  چین: { en: "China", iso: "CHN", flag: "🇨🇳" },
  ژاپن: { en: "Japan", iso: "JPN", flag: "🇯🇵" },
  "کره جنوبی": { en: "South Korea", iso: "KOR", flag: "🇰🇷" },
  سنگاپور: { en: "Singapore", iso: "SGP", flag: "🇸🇬" },
  اندونزی: { en: "Indonesia", iso: "IDN", flag: "🇮🇩" },
  ویتنام: { en: "Vietnam", iso: "VNM", flag: "🇻🇳" },
  فیلیپین: { en: "Philippines", iso: "PHL", flag: "🇵🇭" },
  کامبوج: { en: "Cambodia", iso: "KHM", flag: "🇰" },
  سریلانکا: { en: "Sri Lanka", iso: "LKA", flag: "🇱" },
  مالدیو: { en: "Maldives", iso: "MDV", flag: "🇲" },
  نپال: { en: "Nepal", iso: "NPL", flag: "🇳" },
  یونان: { en: "Greece", iso: "GRC", flag: "🇬🇷" },
  ایتالیا: { en: "Italy", iso: "ITA", flag: "🇮🇹" },
  فرانسه: { en: "France", iso: "FRA", flag: "🇫🇷" },
  اسپانیا: { en: "Spain", iso: "ESP", flag: "🇪🇸" },
  پرتغال: { en: "Portugal", iso: "PRT", flag: "🇵" },
  آلمان: { en: "Germany", iso: "DEU", flag: "🇩🇪" },
  اتریش: { en: "Austria", iso: "AUT", flag: "🇦🇹" },
  سوئیس: { en: "Switzerland", iso: "CHE", flag: "🇨🇭" },
  هلند: { en: "Netherlands", iso: "NLD", flag: "🇳🇱" },
  بلژیک: { en: "Belgium", iso: "BEL", flag: "🇧🇪" },
  مجارستان: { en: "Hungary", iso: "HUN", flag: "🇭🇺" },
  چک: { en: "Czechia", iso: "CZE", flag: "🇨🇿" },
  لهستان: { en: "Poland", iso: "POL", flag: "🇵🇱" },
  کرواسی: { en: "Croatia", iso: "HRV", flag: "🇭" },
  مونته‌نگرو: { en: "Montenegro", iso: "MNE", flag: "🇲🇪" },
  آلبانی: { en: "Albania", iso: "ALB", flag: "🇦🇱" },
  بلغارستان: { en: "Bulgaria", iso: "BGR", flag: "🇧🇬" },
  رومانی: { en: "Romania", iso: "ROU", flag: "🇷" },
  انگلستان: { en: "United Kingdom", iso: "GBR", flag: "🇬🇧" },
  ایرلند: { en: "Ireland", iso: "IRL", flag: "🇮🇪" },
  ایسلند: { en: "Iceland", iso: "ISL", flag: "🇮🇸" },
  نروژ: { en: "Norway", iso: "NOR", flag: "🇳🇴" },
  سوئد: { en: "Sweden", iso: "SWE", flag: "🇸🇪" },
  دانمارک: { en: "Denmark", iso: "DNK", flag: "🇩🇰" },
  فنلاند: { en: "Finland", iso: "FIN", flag: "🇫🇮" },
  اوکراین: { en: "Ukraine", iso: "UKR", flag: "🇺🇦" },
  "گرجستان ": { en: "Georgia", iso: "GEO", flag: "🇬🇪" },
  قزاقستان: { en: "Kazakhstan", iso: "KAZ", flag: "🇰🇿" },
  ازبکستان: { en: "Uzbekistan", iso: "UZB", flag: "🇺🇿" },
  ترکمنستان: { en: "Turkmenistan", iso: "TKM", flag: "🇹🇲" },
  افغانستان: { en: "Afghanistan", iso: "AFG", flag: "🇦🇫" },
  پاکستان: { en: "Pakistan", iso: "PAK", flag: "🇵🇰" },
  عراق: { en: "Iraq", iso: "IRQ", flag: "🇮🇶" },
  سوریه: { en: "Syria", iso: "SYR", flag: "🇸🇾" },
  لبنان: { en: "Lebanon", iso: "LBN", flag: "🇱🇧" },
  اردن: { en: "Jordan", iso: "JOR", flag: "🇯🇴" },
  اسرائیل: { en: "Israel", iso: "ISR", flag: "🇮🇱" },
  عربستان: { en: "Saudi Arabia", iso: "SAU", flag: "🇸🇦" },
  "عربستان سعودی": { en: "Saudi Arabia", iso: "SAU", flag: "🇸🇦" },
  عمان: { en: "Oman", iso: "OMN", flag: "🇴🇲" },
  قطر: { en: "Qatar", iso: "QAT", flag: "🇶🇦" },
  بحرین: { en: "Bahrain", iso: "BHR", flag: "🇧🇭" },
  کویت: { en: "Kuwait", iso: "KWT", flag: "🇰🇼" },
  یمن: { en: "Yemen", iso: "YEM", flag: "🇾🇪" },
  مصر: { en: "Egypt", iso: "EGY", flag: "🇪🇬" },
  مراکش: { en: "Morocco", iso: "MAR", flag: "🇲🇦" },
  تونس: { en: "Tunisia", iso: "TUN", flag: "🇹🇳" },
  الجزایر: { en: "Algeria", iso: "DZA", flag: "🇩🇿" },
  کنیا: { en: "Kenya", iso: "KEN", flag: "🇰🇪" },
  اتیوپی: { en: "Ethiopia", iso: "ETH", flag: "🇪🇹" },
  تانزانیا: { en: "Tanzania", iso: "TZA", flag: "🇹🇿" },
  "آفریقای جنوبی": { en: "South Africa", iso: "ZAF", flag: "🇿🇦" },
  موریس: { en: "Mauritius", iso: "MUS", flag: "🇲🇺" },
  سیشل: { en: "Seychelles", iso: "SYC", flag: "🇸🇨" },
  استرالیا: { en: "Australia", iso: "AUS", flag: "🇦🇺" },
  نیوزیلند: { en: "New Zealand", iso: "NZL", flag: "🇳🇿" },
  کانادا: { en: "Canada", iso: "CAN", flag: "🇨🇦" },
  آمریکا: { en: "United States of America", iso: "USA", flag: "🇺" },
  مکزیک: { en: "Mexico", iso: "MEX", flag: "🇲🇽" },
  کوبا: { en: "Cuba", iso: "CUB", flag: "🇨🇺" },
  برزیل: { en: "Brazil", iso: "BRA", flag: "🇧🇷" },
  آرژانتین: { en: "Argentina", iso: "ARG", flag: "🇦🇷" },
  شیلی: { en: "Chile", iso: "CHL", flag: "🇨🇱" },
  پرو: { en: "Peru", iso: "PER", flag: "🇵🇪" },
  کلمبیا: { en: "Colombia", iso: "COL", flag: "🇨🇴" },
};

/* جستجوی معکوس: نام انگلیسی TopoJSON → اطلاعات کشور */
export function findByEnName(
  en: string,
): (CountryInfo & { fa: string }) | null {
  for (const [fa, info] of Object.entries(COUNTRY_MAP)) {
    if (info.en.toLowerCase() === en.toLowerCase()) {
      return { ...info, fa: fa.trim() };
    }
  }
  return null;
}
