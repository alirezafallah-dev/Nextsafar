<?php

namespace App\Modules\WordPress\DTOs;

/**
 * DTO برای تورهای وردپرس
 */
class TourDTO extends WordPressPostDTO
{
    public function __construct(
        int $id,
        string $title,
        string $slug,
        string $link,
        string $content,
        string $excerpt,
        ?string $featuredImage,
        string $date,
        string $modified,
        string $status,
        array $meta = [],
        // فیلدهای خاص تور
        public readonly ?string $destination = null,
        public readonly ?float $price = null,
        public readonly ?string $currency = 'IRR',
        public readonly ?int $durationDays = null,
        public readonly ?int $durationNights = null,
        public readonly ?string $departureDate = null,
        public readonly ?int $capacity = null,
        public readonly array $includes = [],
        public readonly array $excludes = [],
        public readonly array $gallery = [],
    ) {
        parent::__construct(
            $id, $title, $slug, $link, $content, $excerpt,
            $featuredImage, $date, $modified, $status, $meta
        );
    }

    public static function fromApiResponse(array $data): static
    {
        $base = parent::fromApiResponse($data);
        $acf = $data['acf'] ?? $data['meta'] ?? [];

        return new static(
            id: $base->id,
            title: $base->title,
            slug: $base->slug,
            link: $base->link,
            content: $base->content,
            excerpt: $base->excerpt,
            featuredImage: $base->featuredImage,
            date: $base->date,
            modified: $base->modified,
            status: $base->status,
            meta: $base->meta,
            destination: $acf['destination'] ?? $acf['tour_destination'] ?? null,
            price: isset($acf['price']) ? (float) $acf['price'] : null,
            currency: $acf['currency'] ?? 'IRR',
            durationDays: isset($acf['duration_days']) ? (int) $acf['duration_days'] : null,
            durationNights: isset($acf['duration_nights']) ? (int) $acf['duration_nights'] : null,
            departureDate: $acf['departure_date'] ?? null,
            capacity: isset($acf['capacity']) ? (int) $acf['capacity'] : null,
            includes: self::parseList($acf['includes'] ?? $acf['tour_includes'] ?? ''),
            excludes: self::parseList($acf['excludes'] ?? $acf['tour_excludes'] ?? ''),
            gallery: $acf['gallery'] ?? [],
        );
    }

    private static function parseList(string|array $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (empty(trim($value))) {
            return [];
        }

        // جدا کردن با خط جدید یا کاما
        $items = preg_split('/[\n,،]+/', $value);
        return array_values(array_filter(array_map('trim', $items)));
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'destination' => $this->destination,
            'price' => $this->price,
            'currency' => $this->currency,
            'duration_days' => $this->durationDays,
            'duration_nights' => $this->durationNights,
            'departure_date' => $this->departureDate,
            'capacity' => $this->capacity,
            'includes' => $this->includes,
            'excludes' => $this->excludes,
            'gallery' => $this->gallery,
        ]);
    }
}
