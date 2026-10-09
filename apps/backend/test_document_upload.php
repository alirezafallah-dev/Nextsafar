<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Services\DocumentUploadService;

echo "=== تست آپلود مدارک ===" . PHP_EOL;

$user = User::first();
$booking = Booking::where('user_id', $user->id)
    ->where('booking_type', 'visa')
    ->latest()
    ->first();

if (!$booking) {
    echo "❌ هیچ رزرو ویزایی یافت نشد." . PHP_EOL;
    exit(1);
}

echo "✅ رزرو: {$booking->booking_code}" . PHP_EOL;

// بررسی فایل تستی
if (!file_exists('/tmp/test-passport.png')) {
    echo "❌ فایل تستی PNG یافت نشد" . PHP_EOL;
    exit(1);
}

echo "📄 فایل تستی: " . mime_content_type('/tmp/test-passport.png') . PHP_EOL;

// ساخت UploadedFile با PNG واقعی
$testFile = new \Illuminate\Http\UploadedFile(
    '/tmp/test-passport.png',
    'passport.png',
    'image/png',
    null,
    true  // test mode
);

echo "📋 MIME تشخیص داده شده: " . $testFile->getMimeType() . PHP_EOL;

$service = app(DocumentUploadService::class);

echo PHP_EOL . "📤 آپلود پاسپورت (PNG)..." . PHP_EOL;
$result = $service->upload(
    $booking,
    $testFile,
    'personal_photo',
    null,
    'عکس شخصی علی محمدی'
);

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;

// تست دوم: آپلود PDF
if (file_exists('/tmp/test-document.pdf')) {
    $pdfFile = new \Illuminate\Http\UploadedFile(
        '/tmp/test-document.pdf',
        'passport.pdf',
        'application/pdf',
        null,
        true
    );
    
    echo PHP_EOL . "📤 آپلود اسکن پاسپورت (PDF)..." . PHP_EOL;
    $result2 = $service->upload(
        $booking,
        $pdfFile,
        'passport',
        null,
        'اسکن پاسپورت علی محمدی'
    );
    
    echo json_encode($result2, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
}

echo PHP_EOL . "📋 لیست مدارک:" . PHP_EOL;
$docs = $service->getDocuments($booking);
echo json_encode($docs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
