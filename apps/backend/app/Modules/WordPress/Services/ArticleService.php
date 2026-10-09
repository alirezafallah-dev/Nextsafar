<?php

namespace App\Modules\WordPress\Services;

use App\Modules\WordPress\DTOs\WordPressPostDTO;
use App\Modules\WordPress\Exceptions\WordPressException;
use Illuminate\Support\Facades\Cache;

/**
 * سرویس خواندن مقالات (مجله و وبلاگ) از وردپرس
 * شامل پست تایپ‌های: travelnews (اخبار) و travelguide (راهنما)
 */
class ArticleService
{
    private const CACHE_PREFIX = 'articles:';

    public function __construct(
        private WordPressClient $client
    ) {}

    /**
     * لیست اخبار سفر
     */
    public function getNews(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        return $this->getPostsOfType('travelnews', $filters, $page, $perPage);
    }

    /**
     * لیست راهنماهای سفر
     */
    public function getGuides(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        return $this->getPostsOfType('travelguide', $filters, $page, $perPage);
    }

    /**
     * دریافت خبر بر اساس slug
     */
    public function getNewsBySlug(string $slug): ?array
    {
        return $this->getPostBySlugOfType('travelnews', $slug);
    }

    /**
     * دریافت راهنما بر اساس slug
     */
    public function getGuideBySlug(string $slug): ?array
    {
        return $this->getPostBySlugOfType('travelguide', $slug);
    }

    /**
     * جستجو در مقالات
     */
    public function searchArticles(string $query, string $type = 'travelnews', int $perPage = 20): array
    {
        return $this->getPostsOfType($type, ['search' => $query], 1, $perPage);
    }

    /**
     * متد عمومی: لیست پست‌ها بر اساس نوع
     */
    private function getPostsOfType(string $postType, array $filters, int $page, int $perPage): array
    {
        $cacheKey = self::CACHE_PREFIX . "{$postType}_list_" . md5(serialize([$filters, $page, $perPage]));

        return Cache::remember($cacheKey, 1800, function () use ($postType, $filters, $page, $perPage) {
            $params = [
                'page' => $page,
                'per_page' => $perPage,
                '_embed' => 1,
            ];

            if (!empty($filters['search'])) {
                $params['search'] = $filters['search'];
            }

            if (!empty($filters['category'])) {
                $params['categories'] = $filters['category'];
            }

            if (!empty($filters['orderby'])) {
                $params['orderby'] = $filters['orderby'];
                $params['order'] = $filters['order'] ?? 'desc';
            }

            try {
                $posts = $this->client->getPosts($postType, $params);

                return [
                    'items' => array_map(
                        fn($post) => WordPressPostDTO::fromApiResponse($post)->toArray(),
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
     * متد عمومی: دریافت پست بر اساس slug
     */
    private function getPostBySlugOfType(string $postType, string $slug): ?array
    {
        $cacheKey = self::CACHE_PREFIX . "{$postType}_slug_" . $slug;

        return Cache::remember($cacheKey, 3600, function () use ($postType, $slug) {
            $post = $this->client->getPostBySlug($postType, $slug);

            if (!$post) {
                return null;
            }

            return WordPressPostDTO::fromApiResponse($post)->toArray();
        });
    }
}
