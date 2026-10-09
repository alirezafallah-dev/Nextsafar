<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Modules\Booking\Services\VisaBookingService;
use App\Modules\WordPress\Services\VisaService;

echo "=== تست کامل رزرو ویزا ===" . PHP_EOL . PHP_EOL;

$visaService = app(VisaService::class);
$visaBookingService = app(VisaBookingService::class);

// گام 1: دریافت لیست ویزاها
echo "1️⃣ دریافت لیست ویزاها..." . PHP_EOL;
$visas = $visaService->getVisas([], 1, 10);

if (empty($visas['items'])) {
    echo "❌ هیچ ویزایی یافت نشد" . PHP_EOL;
    exit(1);
}

echo "✅ " . count($visas['items']) . " ویزا یافت شد:" . PHP_EOL;
foreach ($visas['items'] as $v) {
    echo "   - {$v['title']} (slug: {$v['slug']})" . PHP_EOL;
}

$visa = $visas['items'][0];

// گام 2: دریافت کاربر
$user = User::first();
if (!$user) {
    echo "❌ کاربری وجود ندارد" . PHP_EOL;
    exit(1);
}
echo PHP_EOL . "✅ کاربر: {$user->id} - {$user->phone}" . PHP_EOL;

// گام 3: ایجاد رزرو
echo PHP_EOL . "2️⃣ ایجاد رزرو ویزا..." . PHP_EOL;

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
            'email' => 'ali@example.com',
            'phone' => '09121234567',
        ],
        [
            'passenger_type' => 'child',
            'title' => 'MISS',
            'first_name' => 'Sara',
            'last_name' => 'Mohammadi',
            'first_name_fa' => 'سارا',
            'last_name_fa' => 'محمدی',
            'birth_date' => '2015-05-15',
            'gender' => 'female',
            'nationality' => 'Iran',
        ],
    ],
    'applicant_data' => [
        'address' => 'تهران، خیابان ولیعصر',
        'job_title' => 'مهندس نرم‌افزار',
        'company_name' => 'شرکت فناوری',
    ],
];

$result = $visaBookingService->createBooking($user, $bookingData);

if (!$result['success']) {
    echo "❌ خطا: " . $result['message'] . PHP_EOL;
    exit(1);
}

$bookingCode = $result['data']['booking_code'];
$bookingId = $result['data']['id'];

echo "✅ رزرو ایجاد شد: {$bookingCode}" . PHP_EOL;
echo "   ID: {$bookingId}" . PHP_EOL;
echo "   وضعیت: {$result['data']['status_label']}" . PHP_EOL;
echo "   مبلغ: " . number_format($result['data']['financial']['total_amount']) . " {$result['data']['financial']['currency']}" . PHP_EOL;
echo "   تعداد مسافران: " . count($result['data']['passengers']) . PHP_EOL;

// گام 4: جزئیات رزرو
echo PHP_EOL . "3️⃣ دریافت جزئیات رزرو..." . PHP_EOL;
$booking = \App\Modules\Booking\Models\Booking::find($bookingId);
$details = $visaBookingService->getBookingDetails($booking);

if ($details['success']) {
    echo "✅ جزئیات دریافت شد" . PHP_EOL;
    echo "   کد: {$details['data']['booking_code']}" . PHP_EOL;
    echo "   کشور: " . ($details['data']['visa_info']['country'] ?? '-') . PHP_EOL;
    echo "   نوع ویزا: " . ($details['data']['visa_info']['visa_type'] ?? '-') . PHP_EOL;
}

// گام 5: لیست رزروها
echo PHP_EOL . "4️⃣ لیست رزروهای کاربر..." . PHP_EOL;
$bookings = $visaBookingService->getUserBookings($user, 10);
echo "✅ تعداد: {$bookings['meta']['total']}" . PHP_EOL;
foreach ($bookings['data'] as $b) {
    echo "   - {$b['booking_code']}: {$b['visa_title']} ({$b['status_label']})" . PHP_EOL;
}

echo PHP_EOL . "🎉 تست کامل شد!" . PHP_EOL;
echo "📊 Booking ID: {$bookingId}" . PHP_EOL;
echo "📊 Booking Code: {$bookingCode}" . PHP_EOL;
echo "🚀 آماده برای تست آپلود مدارک و پرداخت" . PHP_EOL;
