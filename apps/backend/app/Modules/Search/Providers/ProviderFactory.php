<?php

namespace App\Modules\Search\Providers;

use App\Core\Contracts\ProviderInterface;
use App\Modules\Search\Adapters\SerpApiProvider;
use App\Modules\Search\Adapters\SearchApiProvider;

/**
 * کارخانه ارائه‌دهندگان جستجو
 */
class ProviderFactory
{
    public static function getPrimary(): ProviderInterface
    {
        $provider = config('services.search.primary_provider', 'serpapi');
        return self::create($provider);
    }
    
    public static function getAvailable(): array
    {
        $providers = [
            'serpapi' => new SerpApiProvider(),
            'searchapi' => new SearchApiProvider(),
        ];
        
        return array_filter($providers, fn($p) => $p->isAvailable());
    }
    
    public static function create(string $name): ProviderInterface
    {
        return match($name) {
            'serpapi' => new SerpApiProvider(),
            'searchapi' => new SearchApiProvider(),
            default => throw new \InvalidArgumentException("Unknown provider: {$name}"),
        };
    }
}
