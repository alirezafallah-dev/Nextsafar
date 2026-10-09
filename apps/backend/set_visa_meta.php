<?php
/**
 * تنظیم meta fields برای ویزای تستی
 */

// خواندن wp-config.php برای پیدا کردن نام دیتابیس
$wpConfig = file_get_contents('/var/www/nextsafar/apps/cms/wp-config.php');
preg_match("/define\(\s*'DB_NAME',\s*'([^']+)'\s*\)/", $wpConfig, $matches);
$dbName = $matches[1] ?? 'wordpress';

preg_match("/define\(\s*'DB_USER',\s*'([^']+)'\s*\)/", $wpConfig, $matches);
$dbUser = $matches[1] ?? 'root';

preg_match("/define\(\s*'DB_PASSWORD',\s*'([^']+)'\s*\)/", $wpConfig, $matches);
$dbPass = $matches[1] ?? '';

preg_match("/define\(\s*'DB_HOST',\s*'([^']+)'\s*\)/", $wpConfig, $matches);
$dbHost = $matches[1] ?? 'localhost';

// بررسی table prefix
preg_match("/\\\$table_prefix\s*=\s*'([^']+)'/", $wpConfig, $matches);
$tablePrefix = $matches[1] ?? 'wp_';

echo "=== اطلاعات دیتابیس ===" . PHP_EOL;
echo "Database: $dbName" . PHP_EOL;
echo "User: $dbUser" . PHP_EOL;
echo "Host: $dbHost" . PHP_EOL;
echo "Table Prefix: $tablePrefix" . PHP_EOL;
echo PHP_EOL;

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "=== تنظیم Meta Fields ویزای تستی ===" . PHP_EOL;

    // یافتن ID ویزای تایلند
    $stmt = $pdo->query("SELECT ID, post_title FROM {$tablePrefix}posts WHERE post_type = 'visa' LIMIT 1");
    $visa = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$visa) {
        echo "❌ هیچ ویزایی یافت نشد" . PHP_EOL;
        exit(1);
    }

    $postId = $visa['ID'];
    echo "✅ ویزا یافت شد: ID=$postId, Title={$visa['post_title']}" . PHP_EOL;

    // Meta fields برای تنظیم
    $metaFields = [
        'country' => 'تایلند',
        'country_code' => 'TH',
        'visa_type' => 'tourist',
        'processing_days' => '7',
        'validity_period' => '30 روز',
        
        // فیلدهای metabox که register_rest_field می‌خواند
        '_visa_prices' => serialize([
            [
                'type' => 'سینگل',
                'price' => '5000000',
                'currency' => 'IRR',
                'duration' => '10 روزه',
            ],
            [
                'type' => 'فوری',
                'price' => '7500000',
                'currency' => 'IRR',
                'duration' => '3 روزه',
            ],
        ]),
        
        'requirements' => "پاسپورت با حداقل 6 ماه اعتبار\nعکس 3x4 رنگی\nپرینت حساب بانکی 3 ماه اخیر\nبلیط رفت و برگشت\nرزرو هتل تایید شده",
        
        'required_documents' => "اسکن صفحه اول پاسپورت\nعکس شخصی\nپرینت حساب بانکی\nبلیط پرواز\nواچر هتل\nبیمه مسافرتی",
    ];

    // حذف meta های قدیمی
    $placeholders = implode(',', array_fill(0, count($metaFields), '?'));
    $deleteStmt = $pdo->prepare("DELETE FROM {$tablePrefix}postmeta WHERE post_id = ? AND meta_key IN ($placeholders)");
    $deleteStmt->execute(array_merge([$postId], array_keys($metaFields)));

    // اضافه کردن meta های جدید
    $insertStmt = $pdo->prepare("INSERT INTO {$tablePrefix}postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)");

    foreach ($metaFields as $key => $value) {
        $insertStmt->execute([$postId, $key, $value]);
        $displayValue = is_string($value) && strlen($value) < 50 ? $value : '[' . gettype($value) . ']';
        echo "   ✅ $key = $displayValue" . PHP_EOL;
    }

    echo PHP_EOL . "🎉 " . count($metaFields) . " meta field با موفقیت تنظیم شد!" . PHP_EOL;

    // پاک کردن کش وردپرس
    $pdo->exec("DELETE FROM {$tablePrefix}options WHERE option_name LIKE '_transient_%'");
    $pdo->exec("DELETE FROM {$tablePrefix}options WHERE option_name = 'rewrite_rules'");
    echo "✅ کش وردپرس پاک شد" . PHP_EOL;

} catch (PDOException $e) {
    echo "❌ خطا: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
