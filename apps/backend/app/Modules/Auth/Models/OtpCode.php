<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $table = 'otp_codes';

    protected $fillable = [
        'phone',
        'code_hash',
        'purpose',
        'attempts',
        'ip_address',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'attempts' => 'integer',
    ];

    const MAX_ATTEMPTS = 5;
    const TTL_MINUTES = 5;

    /**
     * Create OTP code
     */
    public static function createCode(string $phone, string $code, string $ip, string $purpose = 'login'): self
    {
        return self::create([
            'phone' => $phone,
            'code_hash' => hash('sha256', $code),
            'purpose' => $purpose,
            'attempts' => 0,
            'ip_address' => $ip,
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);
    }

    /**
     * Verify OTP code
     */
    public static function verify(string $phone, string $code): ?self
    {
        $hash = hash('sha256', $code);

        $otp = self::where('phone', $phone)
            ->where('code_hash', $hash)
            ->where('expires_at', '>', now())
            ->orderBy('id', 'desc')
            ->first();

        if (!$otp) {
            return null;
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            $otp->delete();
            return null;
        }

        $otp->increment('attempts');
        $otp->delete();

        return $otp;
    }

    /**
     * Count recent OTPs for rate limiting
     */
    public static function countRecent(string $phone, string $ip): int
    {
        return self::where(function ($query) use ($phone, $ip) {
            $query->where('phone', $phone)
                ->orWhere('ip_address', $ip);
        })
            ->where('created_at', '>', now()->subMinutes(10))
            ->count();
    }
}
