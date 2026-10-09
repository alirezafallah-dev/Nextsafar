<?php

namespace App\Modules\Hotel\ValueObjects;

/**
 * مختصات جغرافیایی (Value Object)
 */
final class Coordinates
{
    private const EARTH_RADIUS_METERS = 6371000.0;

    public function __construct(
        public readonly ?float $latitude,
        public readonly ?float $longitude
    ) {
        if ($latitude !== null && ($latitude < -90 || $latitude > 90)) {
            throw new \InvalidArgumentException("Invalid latitude: {$latitude}");
        }

        if ($longitude !== null && ($longitude < -180 || $longitude > 180)) {
            throw new \InvalidArgumentException("Invalid longitude: {$longitude}");
        }
    }

    public function isValid(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    /**
     * محاسبه فاصله Haversine به متر
     */
    public function distanceTo(self $other): ?float
    {
        if (!$this->isValid() || !$other->isValid()) {
            return null;
        }

        $lat1 = deg2rad($this->latitude);
        $lat2 = deg2rad($other->latitude);
        $dLat = deg2rad($other->latitude - $this->latitude);
        $dLng = deg2rad($other->longitude - $this->longitude);

        $h = sin($dLat / 2) ** 2 +
             cos($lat1) * cos($lat2) * sin($dLng / 2) ** 2;

        return 2 * self::EARTH_RADIUS_METERS * asin(sqrt($h));
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['lat'] ?? null,
            $data['lng'] ?? $data['lon'] ?? $data['longitude'] ?? null
        );
    }
}
