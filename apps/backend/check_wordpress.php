<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// اتصال به MySQL وردپرس
$pdo = new PDO(
    'mysql:host=localhost;dbname=nextsafar_wp;charset=utf8mb4',
    'nextsafar_wp_user',
    'NextSafar@WP2026!Secure'
);

echo "=== بررسی پست تایپ‌های موجود ===" . PHP_EOL;

$stmt = $pdo->query("SELECT post_type, COUNT(*) as count FROM wp_posts WHERE post_status = 'publish' GROUP BY post_type");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $row) {
    echo "- {$row['post_type']}: {$row['count']} پست" . PHP_EOL;
}

echo PHP_EOL . "=== بررسی ویزاها ===" . PHP_EOL;
$stmt = $pdo->query("SELECT ID, post_title, post_name FROM wp_posts WHERE post_type = 'visa' LIMIT 5");
$visas = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($visas)) {
    echo "❌ هیچ ویزایی وجود ندارد" . PHP_EOL;
} else {
    foreach ($visas as $visa) {
        echo "- ID: {$visa['ID']}, Title: {$visa['post_title']}, Slug: {$visa['post_name']}" . PHP_EOL;
    }
}
