<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Http;

$baseUrl = config('services.wordpress.url', 'http://cms.nextsafar.local');

echo "=== بررسی route های وردپرس ===" . PHP_EOL;

// دریافت لیست namespaces
$response = Http::get("{$baseUrl}/wp-json/");

if ($response->successful()) {
    $data = $response->json();
    echo "✅ نام سایت: " . ($data['name'] ?? 'N/A') . PHP_EOL;
    echo PHP_EOL . "📋 Namespaces موجود:" . PHP_EOL;
    
    foreach ($data['namespaces'] ?? [] as $ns) {
        echo "   - $ns" . PHP_EOL;
    }
    
    // بررسی routes خاص
    echo PHP_EOL . "🔍 بررسی routes:" . PHP_EOL;
    
    $testRoutes = [
        '/wp-json/wp/v2/visa',
        '/wp-json/wp/v2/visas',
        '/wp-json/wp/v2/tour',
        '/wp-json/wp/v2/tours',
        '/wp-json/wp/v2/travelnews',
    ];
    
    foreach ($testRoutes as $route) {
        $resp = Http::get("{$baseUrl}{$route}");
        $status = $resp->status();
        $icon = $status === 200 ? '✅' : '❌';
        $count = $status === 200 ? count($resp->json()) : 0;
        echo "   $icon {$route} → {$status}" . ($count > 0 ? " ({$count} items)" : "") . PHP_EOL;
    }
} else {
    echo "❌ خطا در اتصال: " . $response->status() . PHP_EOL;
}
