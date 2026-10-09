<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Modules\Booking\Services\VisaBookingService;
use App\Modules\WordPress\Services\VisaService;

echo "=== تست رزرو ویزا با قیمت صحیح ===" . PHP_EOL . PHP_EOL;

$visaService = app(VisaService::class);
$visaBookingService = app(VisaBookingService::class);

// گام 1: دریافت اطلاعات ویزا
echo "1️⃣ دریافت اطلاعات ویزا..." . PHP_EOL;
$visas = $visaService->getVisas([], 1, 5);

if (empty($visas['items'])) {
    echo "❌ هیچ ویزایی یافت نشد" . PHP_EOL;
    exit(1);
}

$visa = $visas['items'][0];
echo "✅ ویزا: {$visa['title']}" . PHP_EOL;
echo "   Slug: {$visa['slug']}" . PHP_EOL;
echo "   قیمت: " . ($visa['price'] ?? 'null') . " {$visa['currency']}" . PHP_EOL;
echo "   کشور: " . ($visa['country'] ?? 'null') . PHP_EOL;
echo "   نوع: " . ($visa['visa_type'] ?? 'null') . PHP_EOL;

// گام 2: ایجاد رزرو
$user = User::first();
echo PHP_EOL . "2️⃣ ایجاد رزرو با 2 مسافر (1 بزرگسال + 1 کودک)..." . PHP_EOL;

$bookingData = [
    'visa_slug' => $visa['slug'],
    'passengers' => [
        [
            'passenger_type' => 'adult',
            'title' => 'MR',
            'first_name' => 'Ali',
            'last_name' => 'Mohammadi',
            'first_name_fa' => 'علی',
            'last_name_fa' => 'محمدی',
            'national_id' => '0012345678',
            'passport_number' => 'A12345678',
            'passport_expiry' => '2030-01-01',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'nationality' => 'Iran',
        ],
        [
            'passenger_type' => 'child',
            'first_name' => 'Sara',
            'last_name' => 'Mohammadi',
            'first_name_fa' => 'سارا',
            'last_name_fa' => 'محمدی',
            'birth_date' => '2015-05-15',
            'gender' => 'female',
        ],
    ],
];

$result = $visaBookingService->createBooking($user, $bookingData);

if (!$result['success']) {
    echo "❌ خطا: " . $result['message'] . PHP_EOL;
    exit(1);
}

echo "✅ رزرو ایجاد شد!" . PHP_EOL;
echo "   کد: {$result['data']['booking_code']}" . PHP_EOL;
echo "   مبلغ کل: " . number_format($result['data']['financial']['total_amount']) . " {$result['data']['financial']['currency']}" . PHP_EOL;
echo "   کشور: " . ($result['data']['visa_info']['country'] ?? '-') . PHP_EOL;
echo "   نوع ویزا: " . ($result['data']['visa_info']['visa_type'] ?? '-') . PHP_EOL;

// محاسبه دستی برای چک
$price = $result['data']['visa_info']['price'] ?? 5000000;
$expected = $price * 1.0 + $price * 0.7; // بزرگسال + کودک (70%)
echo PHP_EOL . "🔍 بررسی محاسبه:" . PHP_EOL;
echo "   قیمت پایه: " . number_format($price) . PHP_EOL;
echo "   بزرگسال: " . number_format($price * 1.0) . PHP_EOL;
echo "   کودک (70%): " . number_format($price * 0.7) . PHP_EOL;
echo "   مجموع مورد انتظار: " . number_format($expected) . PHP_EOL;
echo "   مجموع واقعی: " . number_format($result['data']['financial']['total_amount']) . PHP_EOL;

if (abs($result['data']['financial']['total_amount'] - $expected) < 1) {
    echo "   ✅ محاسبه صحیح است!" . PHP_EOL;
} else {
    echo "   ⚠️ اختلاف در محاسبه!" . PHP_EOL;
}

echo PHP_EOL . "🎉 تست کامل شد!" . PHP_EOL;
