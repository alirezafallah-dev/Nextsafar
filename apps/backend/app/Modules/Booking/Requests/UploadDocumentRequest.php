<?php

namespace App\Modules\Booking\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:jpg,jpeg,png,pdf',
            ],
            'document_type' => 'required|string|in:passport,national_id,personal_photo,bank_statement,invitation_letter,hotel_booking,flight_ticket,travel_insurance,employment_letter,marriage_certificate,birth_certificate,other',
            'passenger_id' => 'nullable|integer|exists:booking_passengers,id',
            'title' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'فایل الزامی است',
            'file.max' => 'حجم فایل نباید بیشتر از 10 مگابایت باشد',
            'file.mimes' => 'فقط فایل‌های JPG، PNG و PDF مجاز هستند',
            'document_type.required' => 'نوع مدرک الزامی است',
            'document_type.in' => 'نوع مدرک نامعتبر است',
        ];
    }
}
