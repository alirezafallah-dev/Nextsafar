<?php

namespace App\Modules\Search\Providers;

use App\Core\Contracts\ProviderInterface;
use App\Modules\Search\Adapters\SerpApiProvider;
use App\Modules\Search\Adapters\SearchApiProvider;

/**
 * کارخانه ارائه‌دهندگان جستجو
 * با قابلیت Fallback خودکار
 */
class ProviderFactory
{
    /**
     * دریافت ارائه‌دهنده اصلی
     */
    public static function getPrimary(): ProviderInterface
    {
        $provider = config('services.search.primary_provider', 'serpapi');
        
        return self::create($provider);
    }
    
    /**
     * دریافت همه ارائه‌دهندگان موجود
     */
    public static function getAvailable(): array
    {
        $providers = [
            'serpapi' => new SerpApiProvider(),
            'searchapi' => new SearchApiProvider(),
        ];
        
        return array_filter($providers, fn($p) => $p->isAvailable());
    }
    
    /**
     * ایجاد ارائه‌دهنده
     */
    public static function create(string $name): ProviderInterface
    {
        return match($name) {
            'serpapi' => new SerpApiProvider(),
            'searchapi' => new SearchApiProvider(),
            default => throw new \InvalidArgumentException("Unknown provider: {$name}"),
        };
    }
}
