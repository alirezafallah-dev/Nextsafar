<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

$baseUrl = config('services.wordpress.url', 'http://cms.nextsafar.local');

// ساخت ویزای تستی از طریق REST API
// نکته: این نیاز به احراز هویت دارد، پس یک روش ساده‌تر استفاده می‌کنیم

echo "=== بررسی ویزاهای موجود ===" . PHP_EOL;

$response = Http::get("{$baseUrl}/wp-json/wp/v2/visas");

if ($response->successful()) {
    $visas = $response->json();
    echo "تعداد ویزاهای موجود: " . count($visas) . PHP_EOL;
    
    foreach ($visas as $visa) {
        echo "- ID: {$visa['id']}, Title: {$visa['title']['rendered']}, Slug: {$visa['slug']}" . PHP_EOL;
    }
} else {
    echo "خطا در دریافت ویزاها: " . $response->status() . PHP_EOL;
}

// اگر ویزایی وجود ندارد، یک هشدار بده
if (empty($visas)) {
    echo PHP_EOL . "⚠️ هیچ ویزایی در وردپرس وجود ندارد!" . PHP_EOL;
    echo "لطفاً از پنل وردپرس یک ویزای تستی بسازید." . PHP_EOL;
}
