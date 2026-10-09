<?php

namespace App\Modules\Hotel\DTOs;

use App\Modules\Hotel\ValueObjects\Coordinates;

/**
 * DTO برای هتل‌های آنلاین (از SerpApi/SearchApi)
 */
final class OnlineHotelDTO
{
    public function __construct(
        public readonly string $propertyId,
        public readonly string $name,
        public readonly string $googlePropertyToken,
        public readonly ?string $image,
        public readonly float $rating,
        public readonly int $reviews,
        public readonly string $address,
        public readonly int $stars,
        public readonly array $amenities,
        public readonly string $link,
        public readonly float $priceUsd,
        public readonly float $priceToman,
        public readonly Coordinates $coordinates,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            propertyId: (string) ($data['property_id'] ?? ''),
            name: (string) ($data['name'] ?? ''),
            googlePropertyToken: (string) ($data['google_property_token'] ?? ''),
            image: $data['image'] ?? null,
            rating: (float) ($data['rating'] ?? 0),
            reviews: (int) ($data['reviews'] ?? 0),
            address: (string) ($data['address'] ?? ''),
            stars: (int) ($data['stars'] ?? 0),
            amenities: (array) ($data['amenities'] ?? []),
            link: (string) ($data['link'] ?? ''),
            priceUsd: (float) ($data['price_usd'] ?? 0),
            priceToman: (float) ($data['per_night_toman'] ?? 0),
            coordinates: Coordinates::fromArray($data),
        );
    }
}
