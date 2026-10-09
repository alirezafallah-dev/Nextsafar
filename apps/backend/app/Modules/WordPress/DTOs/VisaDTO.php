<?php

namespace App\Modules\WordPress\DTOs;

/**
 * DTO برای ویزاهای وردپرس
 */
class VisaDTO extends WordPressPostDTO
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
        // فیلدهای خاص ویزا
        public readonly ?string $country = null,
        public readonly ?string $countryCode = null,
        public readonly ?string $visaType = null,
        public readonly ?float $price = null,
        public readonly ?string $currency = 'IRR',
        public readonly ?int $processingDays = null,
        public readonly ?string $validityPeriod = null,
        public readonly array $requirements = [],
        public readonly array $documents = [],
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
            country: $acf['country'] ?? $acf['visa_country'] ?? null,
            countryCode: $acf['country_code'] ?? null,
            visaType: $acf['visa_type'] ?? 'tourist',
            price: isset($acf['price']) ? (float) $acf['price'] : null,
            currency: $acf['currency'] ?? 'IRR',
            processingDays: isset($acf['processing_days']) ? (int) $acf['processing_days'] : null,
            validityPeriod: $acf['validity_period'] ?? null,
            requirements: self::parseList($acf['requirements'] ?? $acf['visa_requirements'] ?? ''),
            documents: self::parseList($acf['required_documents'] ?? ''),
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

        $items = preg_split('/[\n,،]+/', $value);
        return array_values(array_filter(array_map('trim', $items)));
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'country' => $this->country,
            'country_code' => $this->countryCode,
            'visa_type' => $this->visaType,
            'price' => $this->price,
            'currency' => $this->currency,
            'processing_days' => $this->processingDays,
            'validity_period' => $this->validityPeriod,
            'requirements' => $this->requirements,
            'documents' => $this->documents,
        ]);
    }
}
