<?php

namespace App\Modules\Payment\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeSetting extends Model
{
    protected $fillable = [
        'api_key',
        'rates',
        'manual_rates',
        'last_updated_at',
        'cache_duration',
        'use_live_rates',
    ];

    protected $casts = [
        'rates' => 'array',
        'manual_rates' => 'array',
        'last_updated_at' => 'datetime',
        'cache_duration' => 'integer',
        'use_live_rates' => 'boolean',
    ];

    /**
     * دریافت تنها رکورد تنظیمات (Singleton)
     */
    public static function getCurrent(): self
    {
        return self::first() ?? self::create([
            'use_live_rates' => true,
            'cache_duration' => 3600,
        ]);
    }

    /**
     * دریافت نرخ‌های فعال (live یا manual)
     */
    public function getActiveRates(): array
    {
        if ($this->use_live_rates && !empty($this->rates)) {
            return $this->rates;
        }
        
        return $this->manual_rates ?? [];
    }

    /**
     * بروزرسانی نرخ‌ها از API
     */
    public function updateRates(array $rates): void
    {
        $this->update([
            'rates' => $rates,
            'last_updated_at' => now(),
        ]);
    }

    /**
     * بروزرسانی نرخ‌های دستی
     */
    public function updateManualRates(array $rates): void
    {
        $this->update([
            'manual_rates' => $rates,
        ]);
    }

    /**
     * آیا کلید API تنظیم شده؟
     */
    public function hasApiKey(): bool
    {
        return !empty($this->api_key);
    }

    /**
     * مخفی کردن کلید API برای نمایش
     */
    public function getMaskedApiKeyAttribute(): string
    {
        if (empty($this->api_key)) {
            return '—';
        }
        
        $length = strlen($this->api_key);
        if ($length <= 8) {
            return str_repeat('*', $length);
        }
        
        return substr($this->api_key, 0, 4) . str_repeat('*', $length - 8) . substr($this->api_key, -4);
    }
}
