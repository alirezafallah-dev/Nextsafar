<?php

namespace App\Modules\WordPress\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WordPress\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    /**
     * لیست اخبار سفر
     * GET /api/news
     */
    public function news(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category', 'orderby', 'order']);
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $result = $this->articleService->getNews($filters, $page, $perPage);

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => [
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
            ],
        ]);
    }

    /**
     * جزئیات خبر
     * GET /api/news/{slug}
     */
    public function newsDetail(string $slug): JsonResponse
    {
        $article = $this->articleService->getNewsBySlug($slug);

        if (!$article) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'خبر مورد نظر یافت نشد',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    /**
     * لیست راهنماهای سفر
     * GET /api/guides
     */
    public function guides(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category', 'orderby', 'order']);
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $result = $this->articleService->getGuides($filters, $page, $perPage);

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => [
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
            ],
        ]);
    }

    /**
     * جزئیات راهنما
     * GET /api/guides/{slug}
     */
    public function guideDetail(string $slug): JsonResponse
    {
        $article = $this->articleService->getGuideBySlug($slug);

        if (!$article) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'راهنمای مورد نظر یافت نشد',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    /**
     * جستجو در مقالات
     * GET /api/articles/search
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'type' => 'sometimes|in:travelnews,travelguide',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $result = $this->articleService->searchArticles(
            $validated['q'],
            $validated['type'] ?? 'travelnews',
            (int) ($validated['per_page'] ?? 20)
        );

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => [
                'total' => $result['total'],
                'query' => $validated['q'],
                'type' => $validated['type'] ?? 'travelnews',
            ],
        ]);
    }
}
