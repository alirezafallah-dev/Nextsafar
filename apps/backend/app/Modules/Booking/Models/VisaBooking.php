<?php

namespace App\Modules\Booking\Models;

use App\Modules\Booking\Enums\VisaStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisaBooking extends Model
{
    protected $fillable = [
        'booking_id', 'wordpress_post_id', 'visa_title', 'visa_slug',
        'visa_type', 'country', 'country_code', 'visa_status',
        'applicant_data', 'documents', 'submitted_at', 'reviewed_at',
        'issued_at', 'reviewed_by', 'admin_notes', 'rejection_reason',
        'visa_data',
    ];

    protected $casts = [
        'visa_status' => VisaStatus::class,
        'applicant_data' => 'array',
        'documents' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'issued_at' => 'datetime',
        'visa_data' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }

    public function isPendingReview(): bool
    {
        return in_array($this->visa_status, [
            VisaStatus::SUBMITTED,
            VisaStatus::IN_REVIEW,
        ]);
    }

    public function isIssued(): bool
    {
        return $this->visa_status === VisaStatus::ISSUED;
    }

    public function getWordpressUrlAttribute(): string
    {
        $base = rtrim(config('services.wordpress.url', 'http://cms.nextsafar.local'), '/');
        return $this->visa_slug ? "{$base}/visa/{$this->visa_slug}/" : '';
    }

    public function scopePendingReview($query)
    {
        return $query->whereIn('visa_status', [
            VisaStatus::SUBMITTED->value,
            VisaStatus::IN_REVIEW->value,
        ]);
    }
}
