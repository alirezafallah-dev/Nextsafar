<?php

namespace App\Modules\WordPress\Services;

use App\Modules\WordPress\Exceptions\WordPressException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * کلاینت ارتباط با وردپرس
 * 
 * این کلاس مسئول ارتباط با WordPress REST API است
 * و از کش برای بهبود عملکرد استفاده می‌کند
 */
class WordPressClient
{
    private string $baseUrl;
    private int $timeout;
    private string $cachePrefix = 'wp:';
    private int $cacheTTL;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.wordpress.url', 'http://cms.nextsafar.local'), '/');
        $this->timeout = config('services.wordpress.timeout', 15);
        $this->cacheTTL = config('services.wordpress.cache_ttl', 3600); // 1 ساعت
    }

    /**
     * درخواست GET به وردپرس
     */
    public function get(string $endpoint, array $params = []): array
    {
        $url = "{$this->baseUrl}/wp-json/wp/v2/{$endpoint}";
        
        // بررسی کش
        $cacheKey = $this->getCacheKey($endpoint, $params);
        $cached = Cache::get($cacheKey);
        
        if ($cached !== null) {
            Log::debug('WordPress cache hit', ['endpoint' => $endpoint]);
            return $cached;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->get($url, $params);

            if ($response->failed()) {
                Log::error('WordPress request failed', [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw WordPressException::connectionFailed("HTTP {$response->status()}");
            }

            $data = $response->json();

            // ذخیره در کش
            Cache::put($cacheKey, $data, $this->cacheTTL);

            return $data;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('WordPress connection error', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            throw WordPressException::connectionFailed($e->getMessage());
        }
    }

    /**
     * دریافت یک پست خاص
     */
    public function getPost(string $type, int $id): array
    {
        $data = $this->get("{$type}/{$id}");
        
        if (empty($data)) {
            throw WordPressException::postNotFound($type, $id);
        }

        return $data;
    }

    /**
     * دریافت پست بر اساس slug
     */
    public function getPostBySlug(string $type, string $slug): ?array
    {
        $data = $this->get($type, [
            'slug' => $slug,
            '_embed' => 1,
        ]);

        return $data[0] ?? null;
    }

    /**
     * دریافت لیست پست‌ها با صفحه‌بندی
     */
    public function getPosts(string $type, array $params = []): array
    {
        $defaults = [
            'per_page' => 20,
            'page' => 1,
            '_embed' => 1,
        ];

        return $this->get($type, array_merge($defaults, $params));
    }

    /**
     * جستجو در پست‌ها
     */
    public function searchPosts(string $type, string $query, array $params = []): array
    {
        return $this->getPosts($type, array_merge([
            'search' => $query,
        ], $params));
    }

    /**
     * دریافت فیلدهای ACF یک پست
     */
    public function getAcfFields(string $type, int $id): array
    {
        try {
            $data = $this->get("{$type}/{$id}/acf");
            return $data ?: [];
        } catch (\Throwable $e) {
            // اگر افزونه ACF to REST API فعال نباشد، از متا استفاده می‌کنیم
            Log::warning('ACF endpoint not available, falling back to meta', [
                'type' => $type,
                'id' => $id,
            ]);
            return $this->getPostMeta($type, $id);
        }
    }

    /**
     * دریافت متادیتای پست (fallback برای ACF)
     */
    public function getPostMeta(string $type, int $id): array
    {
        // این نیاز به افزونه یا کد سفارشی در وردپرس دارد
        // فعلاً یک آرایه خالی برمی‌گردانیم
        return [];
    }

    /**
     * دریافت دسته‌بندی‌ها
     */
    public function getTaxonomy(string $taxonomy, array $params = []): array
    {
        return $this->get($taxonomy, $params);
    }

    /**
     * دریافت منوها (نیاز به افزونه دارد)
     */
    public function getMenu(string $location = 'mainmenu'): array
    {
        try {
            $url = "{$this->baseUrl}/wp-json/wp/v2/menus?location={$location}";
            $response = Http::timeout($this->timeout)->acceptJson()->get($url);
            
            return $response->successful() ? $response->json() : [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * پاک کردن کش یک پست
     */
    public function clearPostCache(string $type, int $id): void
    {
        Cache::forget("{$this->cachePrefix}{$type}_{$id}");
        Cache::forget("{$this->cachePrefix}{$type}_list");
    }

    /**
     * پاک کردن کش یک نوع پست
     */
    public function clearTypeCache(string $type): void
    {
        // در صورت استفاده از Redis، می‌توان از الگو استفاده کرد
        Cache::forget("{$this->cachePrefix}{$type}_list");
    }

    /**
     * تست اتصال
     */
    public function testConnection(): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->get("{$this->baseUrl}/wp-json/");

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'name' => $response->json('name', 'Unknown'),
                'description' => $response->json('description', ''),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * ساخت کلید کش
     */
    private function getCacheKey(string $endpoint, array $params): string
    {
        return $this->cachePrefix . md5($endpoint . serialize($params));
    }
}
