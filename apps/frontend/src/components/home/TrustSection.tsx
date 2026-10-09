import { ShieldCheck, Headphones, Zap, Award } from "lucide-react";

/* ═══ ۴ ستون اعتماد — بدون نوار مجوزها ═══ */
const PILLARS = [
  {
    icon: ShieldCheck,
    title: "پرداخت امن",
    desc: "تراکنش از درگاه رسمی شاپرک با ضمانت بازگشت وجه",
  },
  {
    icon: Headphones,
    title: "پشتیبانی ۲۴/۷",
    desc: "تیم واقعی، هر ساعت از شبانه‌روز کنار شماست",
  },
  {
    icon: Zap,
    title: "صدور آنی واچر",
    desc: "بلافاصله پس از پرداخت، واچر به دستتان می‌رسد",
  },
  {
    icon: Award,
    title: "مجوزهای رسمی",
    desc: "مورد تأیید سازمان هواپیمایی کشوری و میراث فرهنگی",
  },
];

export default function TrustSection() {
  return (
    <section className="py-10 md:py-14 bg-bg-sec/60 border-t border-border">
      <div className="ns-container">
        {/* ═══ عنوان ═══ */}
        <div className="text-center mb-8">
          <h2 className="ns-section-title !mb-1 inline-block">
            سفر با خیال راحت
          </h2>
          <p className="text-xs md:text-sm text-text-muted">
            هزاران مسافر هر ماه به سفر بعدی اعتماد می‌کنند
          </p>
        </div>

        {/* ═══ ۴ ستون اعتماد — موبایل ۲×۲ / دسکتاپ ۴ستونه ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex flex-col items-center text-center gap-2 rounded-[10px] sm:rounded-lg bg-white border border-border p-4 md:p-5"
              >
                <span className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </span>
                <h3 className="text-xs md:text-sm font-extrabold">{p.title}</h3>
                <p className="text-[11px] md:text-xs text-text-muted leading-5">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}