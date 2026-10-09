<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Modules\WordPress\Services\VisaService;

echo "=== بررسی داده‌های ویزا از وردپرس ===" . PHP_EOL;

$service = app(VisaService::class);
$visas = $service->getVisas([], 1, 5);

if (empty($visas['items'])) {
    echo "❌ هیچ ویزایی یافت نشد" . PHP_EOL;
    exit(1);
}

$visa = $visas['items'][0];

echo "✅ اطلاعات ویزا:" . PHP_EOL;
echo "   ID: {$visa['id']}" . PHP_EOL;
echo "   Title: {$visa['title']}" . PHP_EOL;
echo "   Slug: {$visa['slug']}" . PHP_EOL;
echo "   Country: " . ($visa['country'] ?? 'NULL') . PHP_EOL;
echo "   Country Code: " . ($visa['country_code'] ?? 'NULL') . PHP_EOL;
echo "   Visa Type: " . ($visa['visa_type'] ?? 'NULL') . PHP_EOL;
echo "   Price: " . ($visa['price'] ?? 'NULL') . " {$visa['currency']}" . PHP_EOL;
echo "   Processing Days: " . ($visa['processing_days'] ?? 'NULL') . PHP_EOL;
echo "   Validity: " . ($visa['validity_period'] ?? 'NULL') . PHP_EOL;
echo "   Requirements: " . count($visa['requirements'] ?? []) . " مورد" . PHP_EOL;
echo "   Documents: " . count($visa['documents'] ?? []) . " مورد" . PHP_EOL;

if (!empty($visa['requirements'])) {
    echo PHP_EOL . "📋 مدارک مورد نیاز:" . PHP_EOL;
    foreach ($visa['requirements'] as $req) {
        echo "   - $req" . PHP_EOL;
    }
}
