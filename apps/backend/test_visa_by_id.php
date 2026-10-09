<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$baseUrl = 'http://cms.nextsafar.local';

echo "=== تست مستقیم ویزا از MySQL ===" . PHP_EOL;

// اتصال به دیتابیس وردپرس
$pdo = new PDO(
    'mysql:host=localhost;dbname=nextsafar_wp;charset=utf8mb4',
    'nextsafar_wp_user',
    'NextSafar@WP2026!Secure'
);

// یافتن همه ویزاها
$stmt = $pdo->query("SELECT ID, post_title, post_name, post_status FROM wp_posts WHERE post_type = 'visa'");
$visas = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($visas)) {
    echo "❌ هیچ ویزایی در دیتابیس وجود ندارد" . PHP_EOL;
    exit(1);
}

echo "✅ " . count($visas) . " ویزا یافت شد:" . PHP_EOL;
foreach ($visas as $visa) {
    echo "   - ID: {$visa['ID']}, Title: {$visa['post_title']}, Slug: {$visa['post_name']}, Status: {$visa['post_status']}" . PHP_EOL;
}

$firstVisaId = $visas[0]['ID'];

echo PHP_EOL . "=== تست endpoint با ID = {$firstVisaId} ===" . PHP_EOL;
$response = Http::get("{$baseUrl}/wp-json/wp/v2/visa/{$firstVisaId}");

echo "Status: " . $response->status() . PHP_EOL;
if ($response->successful()) {
    $data = $response->json();
    echo "✅ Title: " . $data['title']['rendered'] . PHP_EOL;
    echo "   Slug: " . $data['slug'] . PHP_EOL;
} else {
    echo "❌ Response: " . substr($response->body(), 0, 500) . PHP_EOL;
}

echo PHP_EOL . "=== تست endpoint با Slug ===" . PHP_EOL;
$slug = $visas[0]['post_name'];
$response = Http::get("{$baseUrl}/wp-json/wp/v2/visa?slug=" . urlencode($slug));

echo "Status: " . $response->status() . PHP_EOL;
if ($response->successful()) {
    $data = $response->json();
    echo "✅ Count: " . count($data) . PHP_EOL;
    if (!empty($data)) {
        echo "   Title: " . $data[0]['title']['rendered'] . PHP_EOL;
    }
} else {
    echo "❌ Response: " . substr($response->body(), 0, 500) . PHP_EOL;
}
