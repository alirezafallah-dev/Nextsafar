<?php

/**
 * تنظیمات ماژول‌های سیستم
 */
return [
    'core' => [
        'enabled' => true,
        'description' => 'هسته اصلی سیستم',
    ],
    
    'search' => [
        'enabled' => true,
        'description' => 'موتور جستجو (پرواز، هتل، تور)',
        'providers' => ['serpapi', 'searchapi'],
    ],
    
    'hotel' => [
        'enabled' => true,
        'description' => 'مدیریت هتل‌ها',
    ],
    
    'flight' => [
        'enabled' => true,
        'description' => 'مدیریت پروازها',
    ],
    
    'auth' => [
        'enabled' => true,
        'description' => 'احراز هویت (OTP + Google)',
    ],
    
    'user' => [
        'enabled' => true,
        'description' => 'مدیریت کاربران',
    ],
    
    'booking' => [
        'enabled' => true,
        'description' => 'سیستم رزرو',
    ],
    
    'payment' => [
        'enabled' => true,
        'description' => 'درگاه‌های پرداخت',
        'gateways' => ['zarinpal', 'idpay'],
    ],
    
    'ai' => [
        'enabled' => true,
        'description' => 'هوش مصنوعی (Trip Planner)',
    ],
    
    'news' => [
        'enabled' => true,
        'description' => 'سیستم اخبار',
    ],
    
    'blog' => [
        'enabled' => true,
        'description' => 'اتصال به وردپرس برای محتوا',
    ],
];
