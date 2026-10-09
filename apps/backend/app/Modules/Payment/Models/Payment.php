<?php

namespace App\Modules\Payment\Models;

use App\Models\User;
use App\Modules\Booking\Models\Booking;
use App\Modules\Payment\Enums\PaymentGateway;
use App\Modules\Payment\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $fillable = [
        'booking_id', 'user_id', 'gateway', 'amount', 'currency', 'status',
        'authority_code', 'transaction_id', 'reference_id', 'card_number',
        'card_hash', 'ip_address', 'user_agent', 'gateway_request',
        'gateway_response', 'callback_data', 'description', 'paid_at',
    ];

    protected $casts = [
        'gateway' => PaymentGateway::class,
        'status' => PaymentStatus::class,
        'amount' => 'decimal:2',
        'gateway_request' => 'array',
        'gateway_response' => 'array',
        'callback_data' => 'array',
        'paid_at' => 'datetime',
    ];

    protected $hidden = [
        'gateway_request',
        'gateway_response',
        'callback_data',
        'card_hash',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public static function generateTransactionId(): string
    {
        return 'NS-PAY-' . date('ymdHis') . '-' . strtoupper(substr(md5((string) mt_rand()), 0, 6));
    }

    public function isSuccessful(): bool
    {
        return $this->status === PaymentStatus::SUCCESS;
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format((float) $this->amount) . ' ' . $this->currency;
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function (Payment $payment) {
            if (empty($payment->transaction_id)) {
                $payment->transaction_id = self::generateTransactionId();
            }
        });
    }
}
