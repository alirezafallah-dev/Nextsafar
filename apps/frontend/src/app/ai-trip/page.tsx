import { Suspense } from "react";
import TripPlannerPage from "@/components/ai-trip/TripPlannerPage";

export const metadata = {
  title: "برنامه‌ریز سفر با هوش مصنوعی | سفر بعدی",
  description:
    "با هوش مصنوعی سفر بعدی، در کمتر از یک دقیقه برنامه سفر کامل و شخصی‌سازی‌شده دریافت کن. هتل، رستوران، جاذبه‌ها و بودجه‌بندی روز به روز.",
};

export default function AiTripPage() {
  return (
    <Suspense
      fallback={
        <div className="ns-container py-24 text-center text-sm text-text-muted">
          در حال بارگذاری...
        </div>
      }
    >
      <TripPlannerPage />
    </Suspense>
  );
}
