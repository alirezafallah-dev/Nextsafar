<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$baseUrl = 'http://cms.nextsafar.local';

echo "=== تست REST API ===" . PHP_EOL;

// تست لیست ویزاها
$response = Http::get("{$baseUrl}/wp-json/wp/v2/visas?per_page=10");

echo "Status: " . $response->status() . PHP_EOL;

if ($response->successful()) {
    $visas = $response->json();
    echo "✅ تعداد ویزاها: " . count($visas) . PHP_EOL;

    foreach ($visas as $visa) {
        echo PHP_EOL . "📌 ID: {$visa['id']}" . PHP_EOL;
        echo "   Title: {$visa['title']['rendered']}" . PHP_EOL;
        echo "   Slug: {$visa['slug']}" . PHP_EOL;
        echo "   Link: {$visa['link']}" . PHP_EOL;

        // نمایش meta fields
        if (!empty($visa['meta'])) {
            echo "   Meta fields:" . PHP_EOL;
            foreach ($visa['meta'] as $key => $value) {
                if (!empty($value) && !is_array($value)) {
                    echo "     - $key: $value" . PHP_EOL;
                }
            }
        }
    }
} else {
    echo "❌ خطا: " . $response->body() . PHP_EOL;
}
