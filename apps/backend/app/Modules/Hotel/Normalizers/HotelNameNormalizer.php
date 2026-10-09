<?php

namespace App\Modules\Hotel\Normalizers;

/**
 * تمیزکننده نام هتل‌ها برای مقایسه دقیق‌تر
 */
final class HotelNameNormalizer
{
    /**
     * کلماتی که باید حذف شوند (stopwords)
     */
    private const STOPWORDS = [
        // English
        'hotel', 'hotels', 'grand', 'resort', 'resorts', 'suites', 'suite',
        'inn', 'lodge', 'motel', 'hostel', 'apartments', 'apartment',
        'international', 'palace', 'plaza', 'tower', 'towers',
        'the', 'and', 'of', 'in', 'at',
        // Persian
        'هتل', 'هتل‌های', 'هتلها', 'مجتمع', 'اقامتگاه', 'بین‌المللی',
        'بزرگ', 'کوچک', 'جدید', 'قدیم',
    ];

    public function normalize(string $name): string
    {
        if (trim($name) === '') {
            return '';
        }

        // تبدیل به lowercase
        $normalized = mb_strtolower($name, 'UTF-8');

        // حذف اعراب
        $normalized = $this->removeDiacritics($normalized);

        // تبدیل نیم‌فاصله و فاصله‌های اضافی به یک فاصله
        $normalized = preg_replace('/[\s\x{200C}\x{00A0}]+/u', ' ', $normalized);

        // حذف علائم نگارشی
        $normalized = preg_replace('/[^\p{L}\p{N}\s]/u', '', $normalized);

        // حذف stopwords
        $words = explode(' ', $normalized);
        $words = array_filter($words, function ($word) {
            return $word !== '' && !in_array($word, self::STOPWORDS, true);
        });

        // مرتب‌سازی کلمات (برای تطبیق بهتر)
        sort($words);

        return implode(' ', $words);
    }

    /**
     * حذف اعراب از متن
     */
    private function removeDiacritics(string $text): string
    {
        $transliteration = [
            'á' => 'a', 'à' => 'a', 'â' => 'a', 'ä' => 'a', 'ã' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'ö' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ñ' => 'n', 'ç' => 'c',
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
        ];

        return strtr($text, $transliteration);
    }
}
