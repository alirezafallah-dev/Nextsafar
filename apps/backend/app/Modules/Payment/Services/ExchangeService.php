<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Models\ExchangeSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * سرویس نرخ ارز - مدیریت از Filament
 * 
 * API: BrsApi.ir
 * Cache: بر اساس cache_duration در exchange_settings
 */
class ExchangeService
{
    private const CACHE_KEY = 'exchange_rates';
    
    /**
     * تبدیل نام فارسی به کد ارز
     */
    private const PERSIAN_TO_CODE = [
        'دلار'        => 'USD',
        'دلار آمریکا' => 'USD',
        'یورو'        => 'EUR',
        'پوند'        => 'GBP',
        'پوند انگلیس' => 'GBP',
        'درهم'        => 'AED',
        'درهم امارات' => 'AED',
        'ریال عمان'   => 'OMR',
        'دینار عراق'  => 'IQD',
        'روبل'        => 'RUB',
        'یوان'        => 'CNY',
        'یوان چین'    => 'CNY',
        'لیر'         => 'TRY',
        'لیر ترکیه'   => 'TRY',
        'بات'         => 'THB',
        'بات تایلند'  => 'THB',
        'رینگیت'      => 'MYR',
        'ریال قطر'    => 'QAR',
        'ریال'        => 'IRR',
    ];

    /**
     * ارزهای پشتیبانی شده
     */
    public static function getSupportedCurrencies(): array
    {
        return [
            'USD' => 'دلار آمریکا',
            'EUR' => 'یورو',
            'GBP' => 'پوند انگلیس',
            'AED' => 'درهم امارات',
            'OMR' => 'ریال عمان',
            'IQD' => 'دینار عراق',
            'RUB' => 'روبل روسیه',
            'CNY' => 'یوان چین',
            'TRY' => 'لیر ترکیه',
            'THB' => 'بات تایلند',
            'MYR' => 'رینگیت مالزی',
            'QAR' => 'ریال قطر',
        ];
    }

    /**
     * نرمال‌سازی نام ارز به کد
     */
    public static function normalizeCode(string $currency): string
    {
        $currency = trim($currency);
        
        if (preg_match('/^[A-Za-z]{3}$/', $currency)) {
            return strtoupper($currency);
        }
        
        foreach (self::PERSIAN_TO_CODE as $persian => $code) {
            if (mb_strpos($currency, $persian) !== false) {
                return $code;
            }
        }
        
        return strtoupper($currency);
    }

    /**
     * دریافت نرخ ارز (به ریال)
     */
    public static function getRate(string $currency): float
    {
        $code = self::normalizeCode($currency);
        
        if ($code === 'IRR') {
            return 1.0;
        }
        
        $rates = self::getExchangeRates();
        
        return $rates[$code] ?? 0.0;
    }

    /**
     * تبدیل مقدار به ریال
     */
    public static function convertToRial(float $amount, string $currency): float
    {
        $rate = self::getRate($currency);
        return $amount * $rate;
    }

    /**
     * دریافت همه نرخ‌ها
     * 
     * اولویت:
     * 1. کش (اگر معتبر باشد)
     * 2. نرخ‌های live از دیتابیس (اگر use_live_rates فعال باشد)
     * 3. نرخ‌های manual از دیتابیس
     */
    public static function getExchangeRates(): array
    {
        $settings = ExchangeSetting::getCurrent();
        $cacheDuration = $settings->cache_duration;
        
        // بررسی کش
        $cached = Cache::get(self::CACHE_KEY);
        if ($cached !== null && is_array($cached) && !empty($cached)) {
            return $cached;
        }

        // دریافت از دیتابیس
        $rates = $settings->getActiveRates();

        // اگر خالی بود و use_live_rates فعال بود، از API بگیر
        if (empty($rates) && $settings->use_live_rates && $settings->hasApiKey()) {
            $rates = self::fetchFromApi($settings->api_key);
            
            if (!empty($rates)) {
                $settings->updateRates($rates);
            }
        }

        // اگر هنوز خالی بود، از manual استفاده کن
        if (empty($rates)) {
            $rates = $settings->manual_rates ?? [];
        }

        // ذخیره در کش
        if (!empty($rates)) {
            Cache::put(self::CACHE_KEY, $rates, $cacheDuration);
        }

        return $rates;
    }

    /**
     * بروزرسانی دستی نرخ‌ها از API (از Filament فراخوانی می‌شود)
     */
    public static function refreshRates(): array
    {
        $settings = ExchangeSetting::getCurrent();
        
        if (!$settings->hasApiKey()) {
            return [
                'success' => false,
                'error' => 'api_key_missing',
                'message' => 'کلید API تنظیم نشده است',
            ];
        }

        $rates = self::fetchFromApi($settings->api_key);
        
        if (empty($rates)) {
            return [
                'success' => false,
                'error' => 'fetch_failed',
                'message' => 'دریافت نرخ‌ها از API ناموفق بود',
            ];
        }

        $settings->updateRates($rates);
        self::clearCache();

        return [
            'success' => true,
            'message' => 'نرخ‌ها با موفقیت بروزرسانی شدند',
            'count' => count($rates),
            'rates' => $rates,
        ];
    }

    /**
     * دریافت نرخ‌ها از BrsApi
     */
    private static function fetchFromApi(string $apiKey): array
    {
        $rates = [];
        $supported = array_keys(self::getSupportedCurrencies());

        // تلاش اول: API با کلید
        try {
            $url = 'https://Api.BrsApi.ir/Market/Gold_Currency.php?key=' . urlencode($apiKey);
            
            $response = Http::timeout(15)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'User-Agent' => 'Mozilla/5.0',
                ])
                ->get($url);

            if ($response->successful()) {
                $data = $response->json();
                $rates = self::parseApiResponse($data, $supported);
            }
        } catch (\Throwable $e) {
            Log::error('BrsApi primary API failed', ['error' => $e->getMessage()]);
        }

        // تلاش دوم: API رایگان (fallback)
        if (empty($rates)) {
            try {
                $url = 'https://brsapi.ir/FreeTsetmcBourseApi/Api_Free_Gold_Currency_v2.json';
                $response = Http::timeout(15)->get($url);
                
                if ($response->successful()) {
                    $data = $response->json();
                    $rates = self::parseApiResponse($data, $supported);
                }
            } catch (\Throwable $e) {
                Log::error('BrsApi fallback API failed', ['error' => $e->getMessage()]);
            }
        }

        return $rates;
    }

    /**
     * پارس پاسخ API
     */
    private static function parseApiResponse(array $data, array $supported): array
    {
        $rates = [];
        $items = [];

        if (isset($data['currency'])) {
            $items = array_merge($items, $data['currency']);
        }
        if (isset($data['gold'])) {
            $items = array_merge($items, $data['gold']);
        }

        foreach ($items as $item) {
            if (!is_array($item)) continue;

            $symbol = isset($item['symbol']) ? strtoupper(trim($item['symbol'])) : '';
            
            if (empty($symbol) && isset($item['code'])) {
                $symbol = strtoupper(trim($item['code']));
            }

            $price = isset($item['price']) 
                ? floatval(str_replace([',', '،'], '', $item['price'])) 
                : 0;
            
            $unit = isset($item['unit']) ? strtolower(trim($item['unit'])) : '';

            if ($price > 0 && in_array($symbol, $supported, true)) {
                if ($unit === 'تومان' || $unit === 'toman') {
                    $price *= 10;
                }

                $rates[$symbol] = $price;
            }
        }

        return $rates;
    }

    /**
     * فرمت قیمت
     */
    public static function formatPrice(float $amount, string $currency = 'IRR'): string
    {
        $symbol = self::getCurrencySymbol($currency);
        return number_format($amount, 0, '.', ',') . ' ' . $symbol;
    }

    /**
     * نماد ارز
     */
    public static function getCurrencySymbol(string $code): string
    {
        $symbols = [
            'IRR' => 'ریال',
            'TOMAN' => 'تومان',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'AED' => 'د.إ',
            'TRY' => '₺',
            'THB' => '฿',
            'CNY' => '¥',
        ];

        return $symbols[strtoupper($code)] ?? $code;
    }

    /**
     * پاک کردن کش
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
