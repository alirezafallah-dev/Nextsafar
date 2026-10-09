<?php
/**
 * NextSafar Core - Module Switch
 * 
 * این فایل کنترل می‌کند که کدام ماژول‌ها در وردپرس فعال باشند
 * و کدام به لاراول منتقل شده‌اند.
 * 
 * @package NextSafar\Core
 * @since 3.0.0
 */

if (!defined('ABSPATH')) exit;

/**
 * وضعیت ماژول‌ها
 * 
 * مقدارها:
 * - 'enabled'  : در وردپرس فعال است
 * - 'migrated' : به لاراول منتقل شده (در وردپرس غیرفعال)
 * - 'disabled' : کلاً غیرفعال
 */
return [
    // ═══════════════════════════════════════════════════════
    // بخش‌هایی که در وردپرس می‌مانند (محتوا)
    // ═══════════════════════════════════════════════════════
    'posttypes' => [
        'hotel'        => 'enabled',
        'airport'      => 'enabled',
        'destination'  => 'enabled',
        'restaurant'   => 'enabled',
        'hospital'     => 'enabled',
        'tour'         => 'enabled',
        'visa'         => 'enabled',
        'travelguide'  => 'enabled',
        'travelnews'   => 'enabled',
    ],
    
    'taxonomies' => [
        'all' => 'enabled',  // همه تکسونومی‌ها فعال
    ],
    
    'metaboxes' => [
        'all' => 'enabled',  // همه متاباکس‌ها فعال
    ],
    
    // ═══════════════════════════════════════════════════════
    // بخش‌هایی که به لاراول منتقل می‌شوند (منطق تجاری)
    // ═══════════════════════════════════════════════════════
    'search' => [
        'live_search'     => 'enabled',  // فعلاً فعال، بعداً مهاجرت
        'hotel_search'    => 'enabled',
        'flight_search'   => 'enabled',
        'hotel_matcher'   => 'enabled',
    ],
    
    'booking' => [
        'booking_table'   => 'enabled',  // فعلاً فعال
        'booking_service' => 'enabled',
        'visa_booking'    => 'enabled',
    ],
    
    'payment' => [
        'payment_table'   => 'enabled',  // فعلاً فعال
        'zarinpal'        => 'enabled',
    ],
    
    'auth' => [
        'otp'             => 'enabled',  // فعلاً فعال
        'google'          => 'enabled',
        'session'         => 'enabled',
    ],
    
    'ai' => [
        'trip_planner'    => 'enabled',  // فعلاً فعال
        'rewriter'        => 'enabled',
    ],
    
    'news' => [
        'sync'            => 'enabled',  // فعلاً فعال
        'filter'          => 'enabled',
    ],
    
    'sync' => [
        'hotel_sync'      => 'enabled',  // فعلاً فعال
        'destination_sync' => 'enabled',
        'restaurant_sync' => 'enabled',
    ],
];
