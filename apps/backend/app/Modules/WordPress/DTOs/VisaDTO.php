<?php

namespace App\Modules\WordPress\DTOs;

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
        // فیلدهای اصلی
        public readonly ?string $country = null,
        public readonly ?string $countryCode = null,
        public readonly ?string $visaType = null,
        public readonly ?float $price = null,
        public readonly ?string $currency = 'IRR',
        public readonly ?int $processingDays = null,
        public readonly ?string $validityPeriod = null,
        public readonly array $requirements = [],
        public readonly array $documents = [],
        // فیلدهای metabox
        public readonly ?string $issue = null,
        public readonly ?string $expiry = null,
        public readonly ?string $banner = null,
        public readonly ?string $description = null,
        // آرایه کامل قیمت‌ها
        public readonly array $prices = [],
    ) {
        parent::__construct(
            $id, $title, $slug, $link, $content, $excerpt,
            $featuredImage, $date, $modified, $status, $meta
        );
    }

    public static function fromApiResponse(array $data): static
    {
        $base = parent::fromApiResponse($data);
        
        $acf = $data['acf'] ?? [];
        $meta = $data['meta'] ?? [];
        $visaInfo = $data['visa_info'] ?? [];
        
        $fields = array_merge($meta, $acf, $visaInfo);

        // پردازش آرایه قیمت‌ها
        $prices = [];
        if (isset($visaInfo['prices']) && is_array($visaInfo['prices'])) {
            $prices = $visaInfo['prices'];
        }

        // محاسبه price_min
        $price = self::parsePrice(
            $fields['price_min'] ?? 
            $fields['price'] ?? 
            $fields['visa_price'] ?? 
            null
        );

        return new static(
            id: $base->id,
            title: $base->title,
            slug: urldecode($base->slug),
            link: $base->link,
            content: $base->content,
            excerpt: $base->excerpt,
            featuredImage: $base->featuredImage,
            date: $base->date,
            modified: $base->modified,
            status: $base->status,
            meta: $base->meta,
            country: $fields['country'] ?? $fields['visa_country'] ?? null,
            countryCode: $fields['country_code'] ?? null,
            visaType: $fields['visa_type'] ?? 'tourist',
            price: $price,
            currency: $fields['currency'] ?? 'IRR',
            processingDays: isset($fields['processing_days']) ? (int) $fields['processing_days'] : null,
            validityPeriod: $fields['validity_period'] ?? null,
            requirements: self::parseList($fields['requirements'] ?? $fields['visa_requirements'] ?? ''),
            documents: self::parseList($fields['required_documents'] ?? ''),
            issue: $fields['issue'] ?? null,
            expiry: $fields['expiry'] ?? null,
            banner: $fields['banner'] ?? null,
            description: $fields['description'] ?? null,
            prices: $prices,
        );
    }

    private static function parsePrice($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        
        if (is_numeric($value)) {
            return (float) $value;
        }
        
        $cleaned = preg_replace('/[^0-9.]/', '', (string) $value);
        return is_numeric($cleaned) ? (float) $cleaned : null;
    }

    /**
     * Parse list from string (supports UTF-8 Persian text)
     */
    private static function parseList(string|array $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (empty(trim($value))) {
            return [];
        }

        // Split by newline first
        $lines = explode("\n", $value);
        
        $items = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            
            // If line contains comma, split it too
            if (str_contains($line, ',') || str_contains($line, '،')) {
                $parts = preg_split('/[,،]+/u', $line);
                foreach ($parts as $part) {
                    $part = trim($part);
                    if ($part !== '') {
                        $items[] = $part;
                    }
                }
            } else {
                $items[] = $line;
            }
        }
        
        return $items;
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
            'issue' => $this->issue,
            'expiry' => $this->expiry,
            'banner' => $this->banner,
            'description' => $this->description,
            'prices' => $this->prices,
        ]);
    }
}
