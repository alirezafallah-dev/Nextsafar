<?php

namespace App\Modules\WordPress\Services;

use App\Modules\WordPress\DTOs\TourDTO;
use App\Modules\WordPress\Exceptions\WordPressException;
use Illuminate\Support\Facades\Cache;

/**
 * سرویس خواندن تورها از وردپرس
 */
class TourService
{
    private const POST_TYPE = 'tours'; // rest_base پست تایپ تور
    private const CACHE_PREFIX = 'tours:';

    public function __construct(
        private WordPressClient $client
    ) {}

    /**
     * لیست تورها با صفحه‌بندی و فیلتر
     */
    public function getTours(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $cacheKey = self::CACHE_PREFIX . 'list_' . md5(serialize([$filters, $page, $perPage]));

        return Cache::remember($cacheKey, 1800, function () use ($filters, $page, $perPage) {
            $params = [
                'page' => $page,
                'per_page' => $perPage,
                '_embed' => 1,
            ];

            // فیلتر بر اساس دسته‌بندی
            if (!empty($filters['category'])) {
                $params['tour_category'] = $filters['category'];
            }

            // جستجو
            if (!empty($filters['search'])) {
                $params['search'] = $filters['search'];
            }

            // مرتب‌سازی
            if (!empty($filters['orderby'])) {
                $params['orderby'] = $filters['orderby'];
                $params['order'] = $filters['order'] ?? 'desc';
            }

            try {
                $posts = $this->client->getPosts(self::POST_TYPE, $params);

                return [
                    'items' => array_map(
                        fn($post) => TourDTO::fromApiResponse($post)->toArray(),
                        $posts
                    ),
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => count($posts),
                ];
            } catch (WordPressException $e) {
                return [
                    'items' => [],
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => 0,
                    'error' => $e->getMessage(),
                ];
            }
        });
    }

    /**
     * دریافت تور بر اساس slug
     */
    public function getTourBySlug(string $slug): ?array
    {
        $cacheKey = self::CACHE_PREFIX . 'slug_' . $slug;

        return Cache::remember($cacheKey, 3600, function () use ($slug) {
            $post = $this->client->getPostBySlug(self::POST_TYPE, $slug);

            if (!$post) {
                return null;
            }

            // اگر فیلدهای ACF جداگانه هستند، آن‌ها را هم بخوان
            $post['acf'] = $this->client->getAcfFields(self::POST_TYPE, $post['id']);

            return TourDTO::fromApiResponse($post)->toArray();
        });
    }

    /**
     * دریافت تور بر اساس ID
     */
    public function getTourById(int $id): ?array
    {
        $cacheKey = self::CACHE_PREFIX . 'id_' . $id;

        return Cache::remember($cacheKey, 3600, function () use ($id) {
            try {
                $post = $this->client->getPost(self::POST_TYPE, $id);
                $post['acf'] = $this->client->getAcfFields(self::POST_TYPE, $id);

                return TourDTO::fromApiResponse($post)->toArray();
            } catch (WordPressException $e) {
                return null;
            }
        });
    }

    /**
     * جستجوی تورها
     */
    public function searchTours(string $query, int $perPage = 20): array
    {
        return $this->getTours(['search' => $query], 1, $perPage);
    }

    /**
     * تورهای پیشنهادی (برای صفحه اصلی)
     */
    public function getFeaturedTours(int $limit = 8): array
    {
        $cacheKey = self::CACHE_PREFIX . 'featured';

        return Cache::remember($cacheKey, 3600, function () use ($limit) {
            try {
                $posts = $this->client->getPosts(self::POST_TYPE, [
                    'per_page' => $limit,
                    '_embed' => 1,
                    'orderby' => 'date',
                    'order' => 'desc',
                ]);

                return array_map(
                    fn($post) => TourDTO::fromApiResponse($post)->toArray(),
                    $posts
                );
            } catch (WordPressException $e) {
                return [];
            }
        });
    }

    /**
     * پاک کردن کش تورها
     */
    public function clearCache(): void
    {
        $this->client->clearTypeCache(self::POST_TYPE);
    }
}
