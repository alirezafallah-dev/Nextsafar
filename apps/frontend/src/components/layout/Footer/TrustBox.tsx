"use client";

/* ═══ نمادهای اعتماد — باز شدن در پنجره شناور بدون referrer ═══ */
const badges = [
  {
    name: "سازمان هواپیمایی کشور",
    url: "https://caa.gov.ir/",
    img: "/images/trust/sazman-hp-img.webp",
  },
  {
    name: "سازمان میراث فرهنگی",
    url: "https://tehran.mcth.ir/",
    img: "/images/trust/Iran-Cultural-Heritage-img.webp",
  },
  {
    name: "انجمن شرکت‌های هواپیمایی",
    url: "http://aira.ir/",
    img: "/images/trust/anjoman-img.webp",
  },
  {
    name: "سامانه حقوق مسافر",
    url: "https://farasa.cao.ir/",
    img: "/images/trust/hoghoogh-img.webp",
  },
  {
    name: "IATA",
    url: "https://www.iata.org/",
    img: "/images/trust/iata-img.webp",
  },
  {
    name: "اینماد",
    url: "https://trustseal.enamad.ir/?id=578840&Code=ppO46zrW01rOZ6fqsA5B6KjMMKWGr6nK",
    img: "https://trustseal.enamad.ir/logo.aspx?id=578840&Code=ppO46zrW01rOZ6fqsA5B6KjMMKWGr6nK",
    remote: true,
  },
];

/* ═══ ابعاد پنجره شناور (مثل popup لاگین Google) ═══ */
const POPUP_W = 480;
const POPUP_H = 640;

/* ═══ باز کردن در پنجره شناور + حذف کامل referrer ═══ */
function openInPopup(url: string) {
  const left = Math.max(0, Math.round((screen.width - POPUP_W) / 2));
  const top = Math.max(0, Math.round((screen.height - POPUP_H) / 2));

  const win = window.open(
    "",
    "ns_trust_popup",
    `popup=yes,width=${POPUP_W},height=${POPUP_H},left=${left},top=${top}`,
  );

  /* اگه مرورگر popup رو بلاک کرد → fallback معمولی با noreferrer */
  if (!win) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const safeUrl = url.replace(/"/g, "%22");
  win.document.open();
  win.document.write(
    `<!doctype html><html lang="fa"><head>` +
      `<meta charset="utf-8">` +
      `<meta name="referrer" content="no-referrer">` +
      `<meta http-equiv="refresh" content="0;url=${safeUrl}">` +
      `<title>در حال انتقال…</title></head>` +
      `<body style="font-family:sans-serif;text-align:center;padding-top:40px;color:#666">در حال انتقال…</body>` +
      `</html>`,
  );
  win.document.close();
  win.focus();
}

export default function TrustBox() {
  return (
    <div>
      <h3 className="sfp3-head text-base mb-3">مجوز ها</h3>
      <div className="border border-border rounded-lg p-2.5 md:p-3 bg-white shadow-card w-fit max-w-full mx-auto lg:mx-0">
        {/* ✅ موبایل: ۳ ستون × ۲ سطر | دسکتاپ: ۲ ستون × ۳ سطر */}
        <ul className="grid grid-cols-3 lg:grid-cols-2 gap-2 lg:gap-3" role="list">
          {badges.map((badge) => (
            <li key={badge.name} className="flex items-center justify-center">
              <a
                href={badge.url}
                /* fallback برای کلیک وسط/راست‌کلیک + SEO */
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                /* کلیک عادی → پنجره شناور */
                onClick={(e) => {
                  e.preventDefault();
                  openInPopup(badge.url);
                }}
                aria-label={badge.name}
                title={badge.name}
                className="block w-full max-w-[90px] h-[75px] md:h-[80px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.img}
                  alt={badge.name}
                  width={180}
                  height={90}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy={badge.remote ? "origin" : "no-referrer"}
                  className="w-full h-full object-contain bg-white border border-border rounded-lg p-1 md:p-1.5 transition hover:opacity-85"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}