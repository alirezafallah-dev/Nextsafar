<?php

namespace App\Modules\Hotel\Calculators;

use App\Modules\Hotel\ValueObjects\Coordinates;

/**
 * ماشین حساب فاصله جغرافیایی
 */
final class GeoDistanceCalculator
{
    /**
     * محاسبه فاصله بین دو نقطه (متر)
     */
    public function distanceInMeters(Coordinates $a, Coordinates $b): ?float
    {
        return $a->distanceTo($b);
    }

    /**
     * بررسی آیا دو نقطه در فاصله مشخصی هستند
     */
    public function areWithinDistance(Coordinates $a, Coordinates $b, float $maxMeters): bool
    {
        $distance = $this->distanceInMeters($a, $b);

        return $distance !== null && $distance <= $maxMeters;
    }
}
