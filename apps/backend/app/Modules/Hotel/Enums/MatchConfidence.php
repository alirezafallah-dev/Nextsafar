<?php

namespace App\Modules\Hotel\Enums;

/**
 * سطوح اطمینان تطبیق
 */
enum MatchConfidence: string
{
    case HIGH = 'high';          // 0.90+
    case MEDIUM = 'medium';      // 0.70-0.89
    case LOW = 'low';            // 0.50-0.69
    case NONE = 'none';          // بدون تطبیق

    public static function fromScore(float $score): self
    {
        return match(true) {
            $score >= 0.90 => self::HIGH,
            $score >= 0.70 => self::MEDIUM,
            $score >= 0.50 => self::LOW,
            default => self::NONE,
        };
    }

    public function color(): string
    {
        return match($this) {
            self::HIGH => 'green',
            self::MEDIUM => 'yellow',
            self::LOW => 'orange',
            self::NONE => 'gray',
        };
    }
}
