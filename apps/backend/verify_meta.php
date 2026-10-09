<?php
// خواندن wp-config.php
$wpConfig = file_get_contents('/var/www/nextsafar/apps/cms/wp-config.php');
preg_match("/define\(\s*'DB_NAME',\s*'([^']+)'\s*\)/", $wpConfig, $m);
$dbName = $m[1];
preg_match("/define\(\s*'DB_USER',\s*'([^']+)'\s*\)/", $wpConfig, $m);
$dbUser = $m[1];
preg_match("/define\(\s*'DB_PASSWORD',\s*'([^']+)'\s*\)/", $wpConfig, $m);
$dbPass = $m[1];
preg_match("/\\\$table_prefix\s*=\s*'([^']+)'/", $wpConfig, $m);
$prefix = $m[1];

$pdo = new PDO("mysql:host=localhost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);

echo "=== Meta های موجود برای ویزای ID=28 ===" . PHP_EOL;
$stmt = $pdo->query("SELECT meta_key, LEFT(meta_value, 100) as value FROM {$prefix}postmeta WHERE post_id = 28 AND meta_key IN ('country', 'country_code', 'visa_type', 'processing_days', '_visa_prices', 'requirements', 'required_documents')");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($rows)) {
    echo "❌ هیچ meta یافت نشد!" . PHP_EOL;
} else {
    echo "✅ " . count($rows) . " meta یافت شد:" . PHP_EOL;
    foreach ($rows as $row) {
        echo "   - {$row['meta_key']}: {$row['value']}" . PHP_EOL;
    }
}
