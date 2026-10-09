<?php

namespace App\Modules\WordPress\DTOs;

/**
 * DTO پایه برای پست‌های وردپرس
 */
class WordPressPostDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $title,
        public readonly string $slug,
        public readonly string $link,
        public readonly string $content,
        public readonly string $excerpt,
        public readonly ?string $featuredImage,
        public readonly string $date,
        public readonly string $modified,
        public readonly string $status,
        public readonly array $meta = [],
    ) {}

    public static function fromApiResponse(array $data): static
    {
        return new static(
            id: $data['id'] ?? 0,
            title: html_entity_decode($data['title']['rendered'] ?? '', ENT_QUOTES, 'UTF-8'),
            slug: $data['slug'] ?? '',
            link: $data['link'] ?? '',
            content: $data['content']['rendered'] ?? '',
            excerpt: html_entity_decode($data['excerpt']['rendered'] ?? '', ENT_QUOTES, 'UTF-8'),
            featuredImage: self::extractFeaturedImage($data),
            date: $data['date'] ?? '',
            modified: $data['modified'] ?? '',
            status: $data['status'] ?? 'publish',
            meta: $data['meta'] ?? [],
        );
    }

    protected static function extractFeaturedImage(array $data): ?string
    {
        // اگر _embed فعال باشد
        $embeddedImage = $data['_embedded']['wp:featuredmedia'][0]['source_url'] ?? null;
        if ($embeddedImage) {
            return $embeddedImage;
        }

        // اگر فقط ID داشته باشیم
        $featuredId = $data['featured_media'] ?? 0;
        return $featuredId > 0 ? null : null; // نیاز به درخواست جداگانه دارد
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'link' => $this->link,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'featured_image' => $this->featuredImage,
            'date' => $this->date,
            'modified' => $this->modified,
        ];
    }
}
