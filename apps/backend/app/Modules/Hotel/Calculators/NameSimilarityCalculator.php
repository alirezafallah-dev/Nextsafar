<?php

namespace App\Modules\Hotel\Calculators;

use App\Modules\Hotel\Normalizers\HotelNameNormalizer;

/**
 * ماشین حساب تشابه نام هتل‌ها
 * از Hybrid Algorithm استفاده می‌کند (Jaccard + Substring + Character-based)
 */
final class NameSimilarityCalculator
{
    private HotelNameNormalizer $normalizer;

    public function __construct(?HotelNameNormalizer $normalizer = null)
    {
        $this->normalizer = $normalizer ?? new HotelNameNormalizer();
    }

    /**
     * محاسبه تشابه بین دو نام هتل
     *
     * @return float مقدار بین 0.0 و 1.0
     */
    public function calculate(string $nameA, string $nameB, bool $normalize = true): float
    {
        if ($nameA === '' || $nameB === '') {
            return 0.0;
        }

        // نرمال‌سازی اگر نیاز باشد
        $a = $normalize ? $this->normalizer->normalize($nameA) : $nameA;
        $b = $normalize ? $this->normalizer->normalize($nameB) : $nameB;

        if ($a === '' || $b === '') {
            return 0.0;
        }

        // Strategy 1: Exact match
        if ($a === $b) {
            return 1.0;
        }

        // Strategy 2: Substring match
        $substringScore = $this->calculateSubstringScore($a, $b);

        // Strategy 3: Word-based Jaccard similarity
        $jaccardScore = $this->calculateJaccardScore($a, $b);

        // Strategy 4: Character-based similarity (for short names)
        $charScore = $this->calculateCharacterScore($a, $b);

        // برگشت بیشترین امتیاز
        return max($substringScore, $jaccardScore, $charScore);
    }

    /**
     * محاسبه امتیاز substring
     */
    private function calculateSubstringScore(string $a, string $b): float
    {
        if (mb_strlen($a) < 3 || mb_strlen($b) < 3) {
            return 0.0;
        }

        if (str_contains($a, $b)) {
            $ratio = mb_strlen($b) / mb_strlen($a);
            return 0.80 + ($ratio * 0.15); // 0.80 to 0.95
        }

        if (str_contains($b, $a)) {
            $ratio = mb_strlen($a) / mb_strlen($b);
            return 0.80 + ($ratio * 0.15);
        }

        return 0.0;
    }

    /**
     * محاسبه امتیاز Jaccard (کلمه‌ای)
     */
    private function calculateJaccardScore(string $a, string $b): float
    {
        $wordsA = array_filter(explode(' ', $a));
        $wordsB = array_filter(explode(' ', $b));

        if (empty($wordsA) || empty($wordsB)) {
            return 0.0;
        }

        $intersection = count(array_intersect($wordsA, $wordsB));
        $union = count(array_unique(array_merge($wordsA, $wordsB)));

        return $union > 0 ? $intersection / $union : 0.0;
    }

    /**
     * محاسبه امتیاز کاراکتری (برای نام‌های کوتاه)
     */
    private function calculateCharacterScore(string $a, string $b): float
    {
        if (mb_strlen($a) >= 30 || mb_strlen($b) >= 30) {
            return 0.0;
        }

        $charsA = $this->mbStrSplit($a);
        $charsB = $this->mbStrSplit($b);

        $intersection = count(array_intersect($charsA, $charsB));
        $union = count(array_unique(array_merge($charsA, $charsB)));

        $score = $union > 0 ? $intersection / $union : 0.0;

        // Boost for very short names
        if (mb_strlen($a) < 15 && mb_strlen($b) < 15) {
            $score *= 1.1;
        }

        return min($score, 1.0);
    }

    /**
     * تقسیم رشته به آرایه کاراکترها (با پشتیبانی از Unicode)
     */
    private function mbStrSplit(string $string): array
    {
        return preg_split('//u', $string, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }
}
