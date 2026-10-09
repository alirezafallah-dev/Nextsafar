<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\BookingDocument;
use App\Modules\Booking\Models\BookingPassenger;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * سرویس مدیریت آپلود مدارک رزرو
 */
class DocumentUploadService
{
    public const ALLOWED_TYPES = [
        'passport' => 'اسکن پاسپورت',
        'national_id' => 'کارت ملی',
        'personal_photo' => 'عکس شخصی',
        'bank_statement' => 'پرینت حساب بانکی',
        'invitation_letter' => 'دعوت‌نامه',
        'hotel_booking' => 'رزرو هتل',
        'flight_ticket' => 'بلیط پرواز',
        'travel_insurance' => 'بیمه مسافرتی',
        'employment_letter' => 'گواهی اشتغال به کار',
        'marriage_certificate' => 'سند ازدواج',
        'birth_certificate' => 'شناسنامه',
        'other' => 'سایر',
    ];

    public const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
    ];

    public const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * آپلود یک مدرک
     */
    public function upload(
        Booking $booking,
        UploadedFile $file,
        string $documentType,
        ?int $passengerId = null,
        ?string $title = null
    ): array {
        // اعتبارسنجی نوع مدرک
        if (!array_key_exists($documentType, self::ALLOWED_TYPES)) {
            return [
                'success' => false,
                'error' => 'invalid_document_type',
                'message' => 'نوع مدرک نامعتبر است',
            ];
        }

        // بررسی MIME type
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            return [
                'success' => false,
                'error' => 'invalid_file_type',
                'message' => 'فقط فایل‌های JPG، PNG و PDF مجاز هستند. MIME: ' . $file->getMimeType(),
            ];
        }

        // بررسی حجم فایل
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return [
                'success' => false,
                'error' => 'file_too_large',
                'message' => 'حجم فایل نباید بیشتر از 10 مگابایت باشد',
            ];
        }

        // بررسی passenger (اگر ارائه شده)
        if ($passengerId !== null) {
            $passenger = BookingPassenger::where('id', $passengerId)
                ->where('booking_id', $booking->id)
                ->first();

            if (!$passenger) {
                return [
                    'success' => false,
                    'error' => 'passenger_not_found',
                    'message' => 'مسافر یافت نشد',
                ];
            }
        }

        try {
            // ساخت نام فایل یکتا
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::uuid() . '.' . $extension;

            // مسیر ذخیره‌سازی
            $folder = "visa-documents/{$booking->booking_code}";
            $filePath = $file->storeAs($folder, $fileName, 'public');

            // URL فایل
            $fileUrl = Storage::disk('public')->url($filePath);

            // ✅ رفع مشکل: صریحاً uploaded_at را ست می‌کنیم
            $uploadedAt = now();

            // ذخیره در دیتابیس
            $document = BookingDocument::create([
                'booking_id' => $booking->id,
                'passenger_id' => $passengerId,
                'document_type' => $documentType,
                'title' => $title ?? self::ALLOWED_TYPES[$documentType],
                'file_path' => $filePath,
                'file_url' => $fileUrl,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => 'uploaded',
                'uploaded_at' => $uploadedAt, // ✅ این خط مشکل را حل می‌کند
            ]);

            return [
                'success' => true,
                'document' => [
                    'id' => $document->id,
                    'type' => $document->document_type,
                    'type_label' => self::ALLOWED_TYPES[$document->document_type],
                    'title' => $document->title,
                    'file_url' => $document->file_url,
                    'original_name' => $document->original_name,
                    'mime_type' => $document->mime_type,
                    'size' => $document->readable_size,
                    'status' => $document->status,
                    'uploaded_at' => $uploadedAt->toIso8601String(),
                ],
            ];

        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => 'upload_failed',
                'message' => 'خطا در آپلود فایل: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * حذف یک مدرک
     */
    public function delete(BookingDocument $document, Booking $booking): array
    {
        if ($document->booking_id !== $booking->id) {
            return [
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما اجازه حذف این مدرک را ندارید',
            ];
        }

        try {
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return [
                'success' => true,
                'message' => 'مدرک با موفقیت حذف شد',
            ];

        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => 'delete_failed',
                'message' => 'خطا در حذف فایل: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * دریافت لیست مدارک یک رزرو
     */
    public function getDocuments(Booking $booking): array
    {
        $documents = $booking->documents()
            ->with('passenger')
            ->orderBy('uploaded_at', 'desc')
            ->get();

        return [
            'success' => true,
            'documents' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->document_type,
                    'type_label' => self::ALLOWED_TYPES[$doc->document_type] ?? 'نامشخص',
                    'title' => $doc->title,
                    'file_url' => $doc->file_url,
                    'original_name' => $doc->original_name,
                    'mime_type' => $doc->mime_type,
                    'size' => $doc->readable_size,
                    'is_image' => $doc->isImage(),
                    'status' => $doc->status,
                    'passenger' => $doc->passenger ? [
                        'id' => $doc->passenger->id,
                        'name' => $doc->passenger->full_name,
                    ] : null,
                    'uploaded_at' => $doc->uploaded_at?->toIso8601String(),
                ];
            })->toArray(),
            'count' => $documents->count(),
        ];
    }

    /**
     * لیست انواع مجاز مدارک
     */
    public function getAllowedTypes(): array
    {
        return self::ALLOWED_TYPES;
    }
}
