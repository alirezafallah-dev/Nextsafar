<?php

namespace App\Modules\Auth\Services;

use App\Models\User;

class AuthService
{
    /**
     * Find or create user by phone (OTP login)
     */
    public function loginWithPhone(string $phone): User
    {
        $user = User::where('phone', $phone)->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'phone' => $phone,
                'name' => 'کاربر ' . substr($phone, -4),
                'signup_method' => 'phone',
                'phone_verified_at' => now(),
                'is_active' => true,
            ]);
        } else {
            // Mark phone as verified
            if (!$user->hasVerifiedPhone()) {
                $user->markPhoneAsVerified();
            }
        }

        return $user;
    }

    /**
     * Find or create user by Google (OAuth login)
     */
    public function loginWithGoogle(string $email, string $name, ?string $avatar, ?string $googleId): User
    {
        $user = User::where('email', $email)
            ->whereNotNull('email')
            ->first();

        if (!$user) {
            // Create new user
            $user = User::create([
                'email' => $email,
                'name' => $name ?: explode('@', $email)[0],
                'signup_method' => 'google',
                'google_id' => $googleId,
                'google_avatar' => $avatar,
                'google_linked_at' => now(),
                'email_verified_at' => now(),
                'is_active' => true,
            ]);
        } else {
            // Update Google info
            $user->update([
                'google_id' => $googleId ?? $user->google_id,
                'google_avatar' => $avatar ?? $user->google_avatar,
                'google_linked_at' => now(),
            ]);
        }

        return $user;
    }

    /**
     * Create API token for user
     */
    public function createToken(User $user, string $deviceName = 'default'): string
    {
        return $user->createToken($deviceName)->plainTextToken;
    }

    /**
     * Revoke all tokens for user
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Get user info array
     */
    public function getUserInfo(User $user): array
    {
        return [
            'id' => $user->id,
            'phone' => $user->phone,
            'email' => $user->email,
            'name' => $user->name,
            'avatar' => $user->google_avatar ?? $user->avatar,
            'signup_method' => $user->signup_method,
            'phone_verified' => $user->hasVerifiedPhone(),
            'email_verified' => $user->email_verified_at !== null,
            'google_linked' => $user->isLinkedToGoogle(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
