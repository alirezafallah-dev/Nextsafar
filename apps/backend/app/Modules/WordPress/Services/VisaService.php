<?php

namespace App\Modules\WordPress\Services;

use App\Modules\WordPress\DTOs\VisaDTO;
use App\Modules\WordPress\Exceptions\WordPressException;
use Illuminate\Support\Facades\Cache;

/**
 * سرویس خواندن ویزاها از وردپرس
 */
class VisaService
{
    private const POST_TYPE = 'visas'; // rest_base پست تایپ ویزا
    private const CACHE_PREFIX = 'visas:';

    public function __construct(
        private WordPressClient $client
    ) {}

    /**
     * لیست ویزاها با صفحه‌بندی و فیلتر
     */
    public function getVisas(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $cacheKey = self::CACHE_PREFIX . 'list_' . md5(serialize([$filters, $page, $perPage]));

        return Cache::remember($cacheKey, 1800, function () use ($filters, $page, $perPage) {
            $params = [
                'page' => $page,
                'per_page' => $perPage,
                '_embed' => 1,
            ];

            // فیلتر بر اساس کشور
            if (!empty($filters['country'])) {
                $params['visa_country'] = $filters['country'];
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
                        fn($post) => VisaDTO::fromApiResponse($post)->toArray(),
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
     * دریافت ویزا بر اساس slug
     */
    public function getVisaBySlug(string $slug): ?array
    {
        $cacheKey = self::CACHE_PREFIX . 'slug_' . $slug;

        return Cache::remember($cacheKey, 3600, function () use ($slug) {
            $post = $this->client->getPostBySlug(self::POST_TYPE, $slug);

            if (!$post) {
                return null;
            }

            $post['acf'] = $this->client->getAcfFields(self::POST_TYPE, $post['id']);

            return VisaDTO::fromApiResponse($post)->toArray();
        });
    }

    /**
     * دریافت ویزا بر اساس ID
     */
    public function getVisaById(int $id): ?array
    {
        $cacheKey = self::CACHE_PREFIX . 'id_' . $id;

        return Cache::remember($cacheKey, 3600, function () use ($id) {
            try {
                $post = $this->client->getPost(self::POST_TYPE, $id);
                $post['acf'] = $this->client->getAcfFields(self::POST_TYPE, $id);

                return VisaDTO::fromApiResponse($post)->toArray();
            } catch (WordPressException $e) {
                return null;
            }
        });
    }

    /**
     * جستجوی ویزاها
     */
    public function searchVisas(string $query, int $perPage = 20): array
    {
        return $this->getVisas(['search' => $query], 1, $perPage);
    }

    /**
     * ویزاهای محبوب (برای صفحه اصلی)
     */
    public function getPopularVisas(int $limit = 8): array
    {
        $cacheKey = self::CACHE_PREFIX . 'popular';

        return Cache::remember($cacheKey, 3600, function () use ($limit) {
            try {
                $posts = $this->client->getPosts(self::POST_TYPE, [
                    'per_page' => $limit,
                    '_embed' => 1,
                    'orderby' => 'date',
                    'order' => 'desc',
                ]);

                return array_map(
                    fn($post) => VisaDTO::fromApiResponse($post)->toArray(),
                    $posts
                );
            } catch (WordPressException $e) {
                return [];
            }
        });
    }

    /**
     * پاک کردن کش ویزاها
     */
    public function clearCache(): void
    {
        $this->client->clearTypeCache(self::POST_TYPE);
    }
}
