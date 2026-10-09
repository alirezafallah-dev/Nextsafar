<?php

namespace App\Modules\Hotel\DTOs;

use App\Modules\Hotel\Enums\MatchMethod;
use App\Modules\Hotel\Enums\MatchConfidence;

/**
 * DTO برای نتیجه تطبیق یک جفت هتل
 */
final class HotelMatchResultDTO
{
    public function __construct(
        public readonly SiteHotelDTO $siteHotel,
        public readonly ?OnlineHotelDTO $onlineHotel,
        public readonly float $confidence,
        public readonly MatchMethod $method,
        public readonly MatchConfidence $level,
    ) {}

    public function isMatched(): bool
    {
        return $this->onlineHotel !== null && $this->confidence > 0;
    }

    public function toArray(): array
    {
        return [
            'source' => 'site',
            'match_confidence' => $this->confidence,
            'match_method' => $this->method->value,
            'match_level' => $this->level->value,
            'site' => [
                'id' => $this->siteHotel->id,
                'slug' => $this->siteHotel->slug,
                'title' => $this->siteHotel->title,
                'title_en' => $this->siteHotel->titleEn,
                'stars' => $this->siteHotel->stars,
                'rating' => $this->siteHotel->rating,
                'address' => $this->siteHotel->address,
                'image' => $this->siteHotel->image,
                'amenities' => $this->siteHotel->amenities,
                'featured' => $this->siteHotel->featured,
                'url' => $this->siteHotel->url,
                'lat' => $this->siteHotel->coordinates->latitude,
                'lng' => $this->siteHotel->coordinates->longitude,
            ],
            'online' => $this->onlineHotel ? [
                'property_id' => $this->onlineHotel->propertyId,
                'name' => $this->onlineHotel->name,
                'image' => $this->onlineHotel->image,
                'rating' => $this->onlineHotel->rating,
                'reviews' => $this->onlineHotel->reviews,
                'address' => $this->onlineHotel->address,
                'stars' => $this->onlineHotel->stars,
                'amenities' => $this->onlineHotel->amenities,
                'link' => $this->onlineHotel->link,
                'token' => $this->onlineHotel->googlePropertyToken,
            ] : null,
            'price' => $this->onlineHotel && $this->onlineHotel->priceToman > 0 ? [
                'per_night_toman' => $this->onlineHotel->priceToman,
                'usd' => $this->onlineHotel->priceUsd,
            ] : null,
            'badges' => array_merge(
                $this->siteHotel->featured ? ['featured'] : [],
                ['site']
            ),
        ];
    }
}
