<?php

namespace App\Core;

use Illuminate\Support\Facades\File;

/**
 * مدیریت ماژول‌های سیستم
 */
class ModuleManager
{
    private static array $modules = [];
    
    /**
     * بارگذاری تنظیمات ماژول‌ها
     */
    public static function load(): void
    {
        $configPath = config_path('modules.php');
        
        if (File::exists($configPath)) {
            self::$modules = require $configPath;
        }
    }
    
    /**
     * بررسی فعال بودن ماژول
     */
    public static function isEnabled(string $module): bool
    {
        if (empty(self::$modules)) {
            self::load();
        }
        
        return (self::$modules[$module]['enabled'] ?? false) === true;
    }
    
    /**
     * دریافت لیست همه ماژول‌ها
     */
    public static function getAll(): array
    {
        if (empty(self::$modules)) {
            self::load();
        }
        
        return self::$modules;
    }
}
