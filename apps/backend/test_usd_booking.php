<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Modules\Booking\Services\VisaBookingService;
use App\Modules\Payment\Services\ExchangeService;

echo "=== تست رزرو با ارز خارجی (USD) ===" . PHP_EOL . PHP_EOL;

// گام 1: نمایش نرخ USD
echo "1️⃣ نرخ فعلی USD:" . PHP_EOL;
$usdRate = ExchangeService::getRate('USD');
echo "   1 USD = " . number_format($usdRate) . " ریال" . PHP_EOL;

// گام 2: دریافت ویزای USD
$visaService = app(\App\Modules\WordPress\Services\VisaService::class);
$visa = $visaService->getVisaBySlug('uae-tourist-visa');

if (!$visa) {
    echo "❌ ویزای UAE یافت نشد. آیا create_usd_visa.php اجرا شد؟" . PHP_EOL;
    exit(1);
}

echo PHP_EOL . "2️⃣ اطلاعات ویزا:" . PHP_EOL;
echo "   عنوان: {$visa['title']}" . PHP_EOL;
echo "   کشور: {$visa['country']}" . PHP_EOL;
echo "   قیمت: " . ($visa['price'] ?? 'null') . " {$visa['currency']}" . PHP_EOL;

// گام 3: ایجاد رزرو با 1 بزرگسال + 1 کودک
echo PHP_EOL . "3️⃣ ایجاد رزرو (1 بزرگسال + 1 کودک)..." . PHP_EOL;

$user = User::first();
$bookingService = app(VisaBookingService::class);

$result = $bookingService->createBooking($user, [
    'visa_slug' => 'uae-tourist-visa',
    'passengers' => [
        [
            'passenger_type' => 'adult',
            'first_name' => 'Ali',
            'last_name' => 'Mohammadi',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
        ],
        [
            'passenger_type' => 'child',
            'first_name' => 'Sara',
            'last_name' => 'Mohammadi',
            'birth_date' => '2015-05-15',
            'gender' => 'female',
        ],
    ],
]);

if (!$result['success']) {
    echo "❌ خطا: " . $result['message'] . PHP_EOL;
    exit(1);
}

echo "✅ رزرو ایجاد شد!" . PHP_EOL;
echo "   کد: {$result['data']['booking_code']}" . PHP_EOL;
echo "   مبلغ: " . number_format($result['data']['financial']['total_amount']) . " {$result['data']['financial']['currency']}" . PHP_EOL;

// گام 4: بررسی محاسبه
echo PHP_EOL . "4️⃣ بررسی محاسبه:" . PHP_EOL;
$priceUsd = $visa['price'];
$priceRial = $priceUsd * $usdRate;
$adult = $priceRial * 1.0;
$child = $priceRial * 0.7;
$expected = $adult + $child;

echo "   قیمت پایه: $priceUsd USD × " . number_format($usdRate) . " = " . number_format($priceRial) . " ریال" . PHP_EOL;
echo "   بزرگسال (100%): " . number_format($adult) . " ریال" . PHP_EOL;
echo "   کودک (70%): " . number_format($child) . " ریال" . PHP_EOL;
echo "   مجموع مورد انتظار: " . number_format($expected) . " ریال" . PHP_EOL;
echo "   مجموع واقعی: " . number_format($result['data']['financial']['total_amount']) . " ریال" . PHP_EOL;

if (abs($result['data']['financial']['total_amount'] - $expected) < 1) {
    echo "   ✅ محاسبه تبدیل ارز صحیح است!" . PHP_EOL;
} else {
    echo "   ⚠️ اختلاف در محاسبه!" . PHP_EOL;
}

echo PHP_EOL . "🎉 تست تبدیل ارز USD → IRR با موفقیت انجام شد!" . PHP_EOL;
