<?php

namespace App\Modules\Hotel\Enums;

/**
 * روش‌های تطبیق هتل‌ها
 */
enum MatchMethod: string
{
    case EXTERNAL_ID = 'external_id';        // تطبیق با ID خارجی
    case NAME_EXACT = 'name_exact';          // تطبیق دقیق نام
    case NAME_STRONG = 'name_strong';        // تطبیق قوی نام
    case NAME_GOOD = 'name_good';            // تطبیق خوب نام
    case NAME_MODERATE = 'name_moderate';    // تطبیق متوسط نام
    case GEO_NAME = 'geo+name';              // جغرافیا + نام
    case GEO_CLOSE_NAME = 'geo_close+name';  // جغرافیای نزدیک + نام
    case NONE = 'none';                      // بدون تطبیق

    public function label(): string
    {
        return match($this) {
            self::EXTERNAL_ID => 'External ID Match',
            self::NAME_EXACT => 'Exact Name Match',
            self::NAME_STRONG => 'Strong Name Match',
            self::NAME_GOOD => 'Good Name Match',
            self::NAME_MODERATE => 'Moderate Name Match',
            self::GEO_NAME => 'Geo + Name Match',
            self::GEO_CLOSE_NAME => 'Close Geo + Name Match',
            self::NONE => 'No Match',
        };
    }
}
