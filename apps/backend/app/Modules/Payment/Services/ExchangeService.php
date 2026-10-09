<?php

namespace App\Modules\Payment\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * سرویس نرخ ارز - منتقل شده از وردپرس
 * 
 * API: BrsApi.ir
 * Cache: 1 ساعت
 */
class ExchangeService
{
    private const CACHE_KEY = 'exchange_rates';
    private const CACHE_DURATION = 3600; // 1 ساعت
    
    /**
     * تبدیل نام فارسی به کد ارز
     * مثال: "درهم" → "AED"
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
        
        // اگر کد 3 حرفی است (USD, AED, ...)
        if (preg_match('/^[A-Za-z]{3}$/', $currency)) {
            return strtoupper($currency);
        }
        
        // جستجو در نام‌های فارسی
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
        
        // IRR همیشه 1 است
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
     * دریافت همه نرخ‌ها (با کش)
     */
    public static function getExchangeRates(): array
    {
        // بررسی کش
        $cached = Cache::get(self::CACHE_KEY);
        if ($cached !== null && is_array($cached) && !empty($cached)) {
            return $cached;
        }

        // دریافت از API
        $rates = self::fetchFromApi();

        // ذخیره در کش
        if (!empty($rates)) {
            Cache::put(self::CACHE_KEY, $rates, self::CACHE_DURATION);
        }

        return $rates;
    }

    /**
     * دریافت نرخ‌ها از BrsApi
     */
    private static function fetchFromApi(): array
    {
        $apiKey = config('services.brsapi.key');
        
        if (empty($apiKey)) {
            Log::warning('BrsApi API key not configured');
            return self::getManualRates();
        }

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

        // اگر باز هم خالی بود، نرخ‌های دستی
        if (empty($rates)) {
            return self::getManualRates();
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
                // اگر تومان بود، تبدیل به ریال
                if ($unit === 'تومان' || $unit === 'toman') {
                    $price *= 10;
                }

                $rates[$symbol] = $price;
            }
        }

        return $rates;
    }

    /**
     * نرخ‌های دستی (fallback)
     */
    private static function getManualRates(): array
    {
        return [
            'USD' => 600000,   // 60,000 تومان = 600,000 ریال
            'EUR' => 650000,
            'GBP' => 750000,
            'AED' => 163000,   // 16,300 تومان
            'TRY' => 18000,    // 1,800 تومان
            'THB' => 17000,    // 1,700 تومان
            'CNY' => 83000,
            'RUB' => 6500,
            'OMR' => 1560000,
            'QAR' => 165000,
            'IQD' => 460,
            'MYR' => 135000,
        ];
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
