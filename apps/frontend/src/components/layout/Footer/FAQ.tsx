"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "سفر بعدی چه خدماتی ارائه می‌کند؟",
    answer:
      "سفر بعدی یک پلتفرم آنلاین گردشگری است که امکان خرید بلیط هواپیما، رزرو هتل، ثبت درخواست ویزا، انتخاب تور، و مشاهده راهنمای سفر و جاذبه‌های گردشگری را در یکجا برای شما فراهم می‌کند.",
  },
  {
    question: "چطور می‌توانم به صورت آنلاین بلیط، هتل یا تور رزرو کنم؟",
    answer:
      "کافی است مقصد و تاریخ سفر را در صفحه اصلی وارد کنید، از بین نتایج بلیط، هتل یا تور مورد نظر را انتخاب کنید و پس از وارد کردن اطلاعات مسافر و پرداخت آنلاین، واچر هتل، بلیط یا رسید تور برای شما صادر و از طریق پیامک، ایمیل و پنل کاربری قابل دسترسی است.",
  },
  {
    question: "برای رزرو تور و ویزا حتماً باید حضوری مراجعه کنم؟",
    answer:
      "در اغلب موارد خیر. ثبت درخواست تور و ویزا به‌صورت کاملاً آنلاین انجام می‌شود و فقط در صورت نیاز به انگشت‌نگاری یا تحویل مدارک اصلی، طبق قوانین سفارت یا مجری تور، حضور شما الزامی است. تمام مراحل از طریق پشتیبانی سفر بعدی به شما اطلاع داده می‌شود.",
  },
  {
    question: "مدارک لازم برای ویزا را از کجا بفهمم؟",
    answer:
      "در صفحه هر ویزا، لیست کامل مدارک، شرایط، مدت زمان صدور و اعتبار ویزا نوشته شده است. در صورت ابهام، می‌توانید با پشتیبانی سفر بعدی تماس بگیرید تا متناسب با نوع سفر و کشور مقصد، مدارک را دقیق‌تر راهنمایی کنند.",
  },
  {
    question: "آیا امکان کنسلی و تغییر تاریخ برای بلیط، هتل یا تور وجود دارد؟",
    answer:
      "امکان کنسلی یا تغییر تاریخ به قوانین ایرلاین، هتل یا مجری تور بستگی دارد. در صفحه هر محصول شرایط کنسلی نوشته شده است. اگر رزرو شما قابل تغییر یا استرداد باشد، از طریق پنل کاربری یا تماس با پشتیبانی، درخواست شما بررسی و با کسر جریمه احتمالی، مابقی مبلغ به شما بازگردانده می‌شود.",
  },
  {
    question: "قیمت‌ها در سفر بعدی واقعی و نهایی است؟",
    answer:
      "بله، قیمت نمایش‌داده‌شده در زمان جستجو و صفحه پرداخت، قیمت نهایی بلیط، هتل یا تور است و تمام مالیات‌ها و عوارض در آن لحاظ شده است. در صورت تغییر لحظه‌ای قیمت از طرف ایرلاین یا تامین‌کننده، سیستم به شما هشدار می‌دهد تا با آگاهی خرید را تکمیل کنید.",
  },
  {
    question: "چگونه از وضعیت درخواست ویزا یا رزرو تور باخبر شوم؟",
    answer:
      "پس از ثبت درخواست، از طریق پیامک، ایمیل و پنل کاربری، مراحل بررسی و وضعیت پرونده‌تان به‌روزرسانی می‌شود. هر زمان تغییری در وضعیت ویزا یا تور ایجاد شود، پیام اطلاع‌رسانی برای شما ارسال خواهد شد.",
  },
  {
    question: "آیا اطلاعات شخصی و پرداخت من در سایت امن است؟",
    answer:
      "بله. سفر بعدی از پروتکل‌های امنیتی به‌روز و درگاه‌های پرداخت معتبر استفاده می‌کند. اطلاعات کارت بانکی شما فقط روی درگاه پرداخت ثبت می‌شود و در سرورهای سفر بعدی ذخیره نمی‌گردد. همچنین سایت دارای مجوزها و نمادهای اعتماد لازم است.",
  },
  {
    question: "در صورت بروز مشکل یا سوال چطور با پشتیبانی در ارتباط باشم؟",
    answer:
      "تیم پشتیبانی سفر بعدی از طریق تلفن، چت آنلاین و تیکت در پنل کاربری پاسخگوی شماست. در هر مرحله از جستجو، خرید، تغییر برنامه سفر، ویزا یا تور می‌توانید با پشتیبانی تماس بگیرید تا راهنمایی‌تان کنند.",
  },
  {
    question:
      "اگر بعد از خرید متوجه شدم اطلاعات مسافر اشتباه وارد شده چه کار کنم؟",
    answer:
      "در سریع‌ترین زمان ممکن با پشتیبانی سفر بعدی تماس بگیرید. امکان اصلاح نام یا مشخصات به قوانین ایرلاین، هتل یا مجری تور بستگی دارد. هر چه زودتر اطلاع دهید، شانس اصلاح یا کاهش جریمه بیشتر خواهد بود.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-10">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-text-strong mb-8">
        سوالات متداول درباره خدمات سفر بعدی
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`ns-card transition-all ${
                isOpen ? "!shadow-card-hover" : ""
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-text-strong text-sm md:text-base leading-relaxed">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-primary-500 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-text-muted text-sm leading-relaxed border-t border-divider pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
