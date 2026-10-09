import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import MenuColumns from "./MenuColumns";
import TrustBox from "./TrustBox";
import BottomBar from "./BottomBar";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      {/* ═══ Newsletter Box — دام لید ═══ */}
      <Newsletter />

      {/* ═══ فوتر اصلی ═══ */}
      <div className="border-t bg-bg-sec border-border pt-6 pb-8">
        <div className="ns-container">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(270px,1fr)_minmax(450px,3.2fr)_minmax(180px,0.9fr)] gap-8">
            {/* ─── ستون راست: لوگو + شعار + تماس ─── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="سفر بعدی ایرانیان"
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <div className="text-text-strong font-bold text-lg">
                    سفر بعدی ایرانیان
                  </div>
                  <div className="text-text-muted text-xs">
                    Next Safar Iranian
                  </div>
                </div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                رزرو پرواز، هتل و تور با پشتیبانی ۲۴ ساعته؛ تجربه‌ای ساده، شفاف و مطمئن.
              </p>

              {/* اطلاعات تماس — ✅ ایمیل عادی */}
              <ul className="mt-4 divide-y divide-border">
                <li className="grid grid-cols-[18px_1fr] gap-3 items-start py-3">
                  <MapPin className="w-4 h-4 text-text-strong mt-1" />
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <span className="text-text-strong text-sm">آدرس</span>
                    <span className="text-sm text-text leading-6">
                      تهران، صادقیه، فلکه اول، مجتمع تجاری گلدیس
                    </span>
                  </div>
                </li>
                <li className="grid grid-cols-[18px_1fr] gap-3 items-start py-3">
                  <Mail className="w-4 h-4 text-text-strong mt-1" />
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <span className="text-text-strong text-sm">ایمیل</span>
                    <a
                      href="mailto:info@nextsafar.com"
                      className="text-sm text-text hover:text-primary transition-colors"
                    >
                      info[at]nextsafar[dot]com
                    </a>
                  </div>
                </li>
                <li className="grid grid-cols-[18px_1fr] gap-3 items-start py-3">
                  <Phone className="w-4 h-4 text-text-strong mt-1" />
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <span className="text-text-strong text-sm">تلفن</span>
                    <a
                      href="tel:02182801754"
                      dir="ltr"
                      className="text-sm text-text hover:text-primary transition-colors"
                    >
                      021-8280 1754
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* ─── ستون وسط: منوها (از endpoint) ─── */}
            <div>
              <MenuColumns />
            </div>

            {/* ─── ستون چپ: مجوزها ─── */}
            <div>
              <TrustBox />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ نوار پایین ═══ */}
      <BottomBar />
    </footer>
  );
}