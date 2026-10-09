<?php

namespace App\Modules\Hotel\DTOs;

use App\Modules\Hotel\ValueObjects\Coordinates;

/**
 * DTO برای هتل‌های سایت (از وردپرس)
 */
final class SiteHotelDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $slug,
        public readonly string $title,
        public readonly string $titleEn,
        public readonly string $externalId,
        public readonly int $stars,
        public readonly float $rating,
        public readonly string $address,
        public readonly ?string $image,
        public readonly array $amenities,
        public readonly bool $featured,
        public readonly string $url,
        public readonly Coordinates $coordinates,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) ($data['id'] ?? 0),
            slug: (string) ($data['slug'] ?? ''),
            title: (string) ($data['title'] ?? ''),
            titleEn: (string) ($data['title_en'] ?? ''),
            externalId: (string) ($data['external_id'] ?? ''),
            stars: (int) ($data['stars'] ?? 0),
            rating: (float) ($data['rating'] ?? 0),
            address: (string) ($data['address'] ?? ''),
            image: $data['image'] ?? null,
            amenities: (array) ($data['amenities'] ?? []),
            featured: (bool) ($data['featured'] ?? false),
            url: (string) ($data['url'] ?? ''),
            coordinates: Coordinates::fromArray($data),
        );
    }
}
