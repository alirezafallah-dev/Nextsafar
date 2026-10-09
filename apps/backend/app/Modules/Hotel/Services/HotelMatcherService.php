<?php

namespace App\Modules\Hotel\Services;

use App\Modules\Hotel\Calculators\GeoDistanceCalculator;
use App\Modules\Hotel\Calculators\NameSimilarityCalculator;
use App\Modules\Hotel\DTOs\HotelMatchResultDTO;
use App\Modules\Hotel\DTOs\OnlineHotelDTO;
use App\Modules\Hotel\DTOs\SiteHotelDTO;
use App\Modules\Hotel\Enums\MatchConfidence;
use App\Modules\Hotel\Enums\MatchMethod;
use App\Modules\Hotel\Normalizers\HotelNameNormalizer;
use Illuminate\Support\Facades\Log;

/**
 * سرویس اصلی تطبیق هتل‌ها
 *
 * این سرویس هتل‌های سایت (وردپرس) را با هتل‌های آنلاین (SerpApi/SearchApi) تطبیق می‌دهد
 */
final class HotelMatcherService
{
    private NameSimilarityCalculator $nameSimilarity;
    private GeoDistanceCalculator $geoDistance;
    private HotelNameNormalizer $normalizer;

    public function __construct(
        ?NameSimilarityCalculator $nameSimilarity = null,
        ?GeoDistanceCalculator $geoDistance = null,
        ?HotelNameNormalizer $normalizer = null
    ) {
        $this->normalizer = $normalizer ?? new HotelNameNormalizer();
        $this->nameSimilarity = $nameSimilarity ?? new NameSimilarityCalculator($this->normalizer);
        $this->geoDistance = $geoDistance ?? new GeoDistanceCalculator();
    }

    /**
     * تطبیق و ادغام هتل‌های سایت با هتل‌های آنلاین
     *
     * @param SiteHotelDTO[] $siteHotels
     * @param OnlineHotelDTO[] $onlineHotels
     * @return array{items: array, matched: int, site_count: int, online_count: int}
     */
    public function matchAndMerge(array $siteHotels, array $onlineHotels): array
    {
        $startTime = microtime(true);

        // گام 1: Pre-normalize نام‌های سایت (بهینه‌سازی)
        $siteNormalized = $this->preNormalizeSiteHotels($siteHotels);

        // گام 2: ساخت لیست کاندیداها با امتیاز
        $candidates = $this->buildCandidates($siteHotels, $onlineHotels, $siteNormalized);

        // گام 3: Greedy Assignment (بالاترین امتیاز اول)
        $matches = $this->greedyAssignment($candidates);

        // گام 4: ساخت نتایج نهایی
        $siteItems = $this->buildSiteItems($siteHotels, $onlineHotels, $matches);
        $onlineItems = $this->buildUnmatchedOnlineItems($onlineHotels, $matches);

        $executionTime = (microtime(true) - $startTime) * 1000;

        Log::info('Hotel matching completed', [
            'site_count' => count($siteHotels),
            'online_count' => count($onlineHotels),
            'matched' => count($matches),
            'execution_time_ms' => round($executionTime, 2),
        ]);

        // مرتب‌سازی: featured → stars → rating
        usort($siteItems, fn($a, $b) => $this->compareSiteItems($a, $b));

        // مرتب‌سازی آنلاین‌ها بر اساس rating
        usort($onlineItems, fn($a, $b) => $b['online']['rating'] <=> $a['online']['rating']);

        return [
            'items' => array_merge($siteItems, $onlineItems),
            'matched' => count($matches),
            'site_count' => count($siteHotels),
            'online_count' => count($onlineHotels),
        ];
    }

    /**
     * پیش‌نرمال‌سازی نام‌های سایت
     *
     * @param SiteHotelDTO[] $siteHotels
     * @return array<int, array{fa: string, en: string}>
     */
    private function preNormalizeSiteHotels(array $siteHotels): array
    {
        $normalized = [];

        foreach ($siteHotels as $index => $hotel) {
            $normalized[$index] = [
                'fa' => $this->normalizer->normalize($hotel->title),
                'en' => $hotel->titleEn !== '' ? $this->normalizer->normalize($hotel->titleEn) : '',
            ];
        }

        return $normalized;
    }

    /**
     * ساخت لیست کاندیداها با امتیاز
     */
    private function buildCandidates(
        array $siteHotels,
        array $onlineHotels,
        array $siteNormalized
    ): array {
        $candidates = [];

        foreach ($onlineHotels as $onlineIndex => $onlineHotel) {
            // T1: External ID match (بالاترین اولویت)
            foreach ($siteHotels as $siteIndex => $siteHotel) {
                if ($siteHotel->externalId !== '' &&
                    $siteHotel->externalId === $onlineHotel->googlePropertyToken) {
                    $candidates[] = [
                        'confidence' => 1.0,
                        'site_index' => $siteIndex,
                        'online_index' => $onlineIndex,
                        'method' => MatchMethod::EXTERNAL_ID,
                    ];
                    continue 2; // برو به online بعدی
                }
            }

            $onlineNameNorm = $this->normalizer->normalize($onlineHotel->name);

            // T2: Name + Location matching
            foreach ($siteHotels as $siteIndex => $siteHotel) {
                $distance = $this->geoDistance->distanceInMeters(
                    $siteHotel->coordinates,
                    $onlineHotel->coordinates
                );

                // محاسبه تشابه (فارسی یا انگلیسی - هر کدام بالاتر)
                $simFa = $this->nameSimilarity->calculate(
                    $siteNormalized[$siteIndex]['fa'],
                    $onlineNameNorm,
                    false // قبلاً نرمال شده
                );
                $simEn = $siteNormalized[$siteIndex]['en'] !== ''
                    ? $this->nameSimilarity->calculate(
                        $siteNormalized[$siteIndex]['en'],
                        $onlineNameNorm,
                        false
                    )
                    : 0.0;
                $similarity = max($simFa, $simEn);

                // قوانین امتیازدهی
                $match = $this->evaluateMatch($similarity, $distance);

                if ($match !== null) {
                    $candidates[] = [
                        'confidence' => $match['confidence'],
                        'site_index' => $siteIndex,
                        'online_index' => $onlineIndex,
                        'method' => $match['method'],
                    ];
                }
            }
        }

        return $candidates;
    }

    /**
     * ارزیابی یک جفت برای تطبیق
     */
    private function evaluateMatch(float $similarity, ?float $distance): ?array
    {
        // Almost exact match
        if ($similarity >= 0.95) {
            return ['confidence' => 0.95, 'method' => MatchMethod::NAME_EXACT];
        }

        // Strong name match
        if ($similarity >= 0.80) {
            return ['confidence' => 0.88, 'method' => MatchMethod::NAME_STRONG];
        }

        // Good name match
        if ($similarity >= 0.70) {
            return ['confidence' => 0.75, 'method' => MatchMethod::NAME_GOOD];
        }

        // Close location + acceptable name
        if ($distance !== null && $distance <= 100 && $similarity >= 0.50) {
            return ['confidence' => 0.70, 'method' => MatchMethod::GEO_NAME];
        }

        // Very close location + some name similarity
        if ($distance !== null && $distance <= 50 && $similarity >= 0.35) {
            return ['confidence' => 0.65, 'method' => MatchMethod::GEO_CLOSE_NAME];
        }

        // Moderate name similarity
        if ($similarity >= 0.60) {
            return ['confidence' => 0.60, 'method' => MatchMethod::NAME_MODERATE];
        }

        return null;
    }

    /**
     * Greedy Assignment - انتخاب بهترین تطبیق‌ها
     * هر سایت و هر آنلاین فقط یک بار می‌تواند تطبیق داده شود
     */
    private function greedyAssignment(array $candidates): array
    {
        // مرتب‌سازی بر اساس امتیاز (نزولی)
        usort($candidates, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

        $usedSite = [];
        $usedOnline = [];
        $matches = [];

        foreach ($candidates as $candidate) {
            $siteIdx = $candidate['site_index'];
            $onlineIdx = $candidate['online_index'];

            // اگر هر دو آزاد باشند، تطبیق بده
            if (!isset($usedSite[$siteIdx]) && !isset($usedOnline[$onlineIdx])) {
                $matches[$onlineIdx] = [
                    'site_index' => $siteIdx,
                    'confidence' => $candidate['confidence'],
                    'method' => $candidate['method'],
                ];
                $usedSite[$siteIdx] = true;
                $usedOnline[$onlineIdx] = true;
            }
        }

        return $matches;
    }

    /**
     * ساخت آیتم‌های سایت (با تطبیق‌هایشان)
     */
    private function buildSiteItems(
        array $siteHotels,
        array $onlineHotels,
        array $matches
    ): array {
        $items = [];

        // ایجاد نگاشت معکوس: site_index => match info
        $siteToMatch = [];
        foreach ($matches as $onlineIdx => $match) {
            $siteToMatch[$match['site_index']] = [
                'online_index' => $onlineIdx,
                'confidence' => $match['confidence'],
                'method' => $match['method'],
            ];
        }

        foreach ($siteHotels as $siteIndex => $siteHotel) {
            $matchInfo = $siteToMatch[$siteIndex] ?? null;
            $onlineHotel = $matchInfo ? $onlineHotels[$matchInfo['online_index']] : null;

            $result = new HotelMatchResultDTO(
                siteHotel: $siteHotel,
                onlineHotel: $onlineHotel,
                confidence: $matchInfo['confidence'] ?? 0.0,
                method: $matchInfo['method'] ?? MatchMethod::NONE,
                level: MatchConfidence::fromScore($matchInfo['confidence'] ?? 0.0)
            );

            $items[] = $result->toArray();
        }

        return $items;
    }

    /**
     * ساخت آیتم‌های آنلاین بدون تطبیق
     */
    private function buildUnmatchedOnlineItems(array $onlineHotels, array $matches): array
    {
        $items = [];

        foreach ($onlineHotels as $index => $onlineHotel) {
            if (isset($matches[$index])) {
                continue; // قبلاً تطبیق داده شده
            }

            $items[] = [
                'source' => 'online',
                'match_confidence' => null,
                'match_method' => null,
                'match_level' => null,
                'site' => null,
                'online' => [
                    'property_id' => $onlineHotel->propertyId,
                    'name' => $onlineHotel->name,
                    'image' => $onlineHotel->image,
                    'rating' => $onlineHotel->rating,
                    'reviews' => $onlineHotel->reviews,
                    'address' => $onlineHotel->address,
                    'stars' => $onlineHotel->stars,
                    'amenities' => $onlineHotel->amenities,
                    'link' => $onlineHotel->link,
                    'token' => $onlineHotel->googlePropertyToken,
                ],
                'price' => $onlineHotel->priceToman > 0 ? [
                    'per_night_toman' => $onlineHotel->priceToman,
                    'usd' => $onlineHotel->priceUsd,
                ] : null,
                'badges' => ['online'],
            ];
        }

        return $items;
    }

    /**
     * مقایسه دو آیتم سایت برای مرتب‌سازی
     * اولویت: featured → stars → rating
     */
    private function compareSiteItems(array $a, array $b): int
    {
        return [
            $b['site']['featured'] ? 1 : 0,
            $b['site']['stars'],
            $b['site']['rating'],
        ] <=> [
            $a['site']['featured'] ? 1 : 0,
            $a['site']['stars'],
            $a['site']['rating'],
        ];
    }
}
