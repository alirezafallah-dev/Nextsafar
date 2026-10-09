<?php
/**
 * NextSafar Core - Module Manager
 * 
 * مدیریت وضعیت ماژول‌ها و کنترل بارگذاری آن‌ها
 * 
 * @package NextSafar\Core
 * @since 3.0.0
 */

namespace NextSafar\Core;

if (!defined('ABSPATH')) exit;

class ModuleManager {
    
    /**
     * تنظیمات ماژول‌ها
     */
    private static ?array $config = null;
    
    /**
     * بارگذاری تنظیمات
     */
    public static function load(): void {
        if (self::$config === null) {
            $config_file = NEXTSAFAR_PATH . 'inc/module-switch.php';
            self::$config = file_exists($config_file) ? require $config_file : [];
        }
    }
    
    /**
     * بررسی فعال بودن یک ماژول
     */
    public static function isEnabled(string $section, string $module): bool {
        self::load();
        
        // بررسی 'all' برای بخش‌هایی مثل taxonomies
        if (isset(self::$config[$section]['all'])) {
            return self::$config[$section]['all'] === 'enabled';
        }
        
        return (self::$config[$section][$module] ?? 'disabled') === 'enabled';
    }
    
    /**
     * بررسی مهاجرت یک ماژول به لاراول
     */
    public static function isMigrated(string $section, string $module): bool {
        self::load();
        
        return (self::$config[$section][$module] ?? '') === 'migrated';
    }
    
    /**
     * دریافت وضعیت همه ماژول‌ها
     */
    public static function getAllStatus(): array {
        self::load();
        return self::$config;
    }
    
    /**
     * به‌روزرسانی وضعیت یک ماژول
     */
    public static function setStatus(string $section, string $module, string $status): bool {
        self::load();
        
        $valid_statuses = ['enabled', 'migrated', 'disabled'];
        if (!in_array($status, $valid_statuses)) {
            return false;
        }
        
        self::$config[$section][$module] = $status;
        
        // ذخیره در فایل
        return self::saveConfig();
    }
    
    /**
     * ذخیره تنظیمات در فایل
     */
    private static function saveConfig(): bool {
        $config_file = NEXTSAFAR_PATH . 'inc/module-switch.php';
        
        $content = "<?php\n/**\n * NextSafar Core - Module Switch\n * Auto-generated: " . date('Y-m-d H:i:s') . "\n */\n\nif (!defined('ABSPATH')) exit;\n\nreturn " . var_export(self::$config, true) . ";\n";
        
        return file_put_contents($config_file, $content) !== false;
    }
}
