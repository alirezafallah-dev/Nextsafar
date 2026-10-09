<?php

namespace App\Modules\Booking\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateVisaBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visa_slug' => 'required|string|max:255',

            'passengers' => 'required|array|min:1|max:10',
            'passengers.*.passenger_type' => 'required|in:adult,child,infant',
            'passengers.*.title' => 'nullable|in:MR,MRS,MS,MISS,MASTER',
            'passengers.*.first_name' => 'required|string|max:100',
            'passengers.*.last_name' => 'required|string|max:100',
            'passengers.*.first_name_fa' => 'nullable|string|max:100',
            'passengers.*.last_name_fa' => 'nullable|string|max:100',
            'passengers.*.national_id' => 'nullable|string|max:20',
            'passengers.*.passport_number' => 'nullable|string|max:50',
            'passengers.*.passport_expiry' => 'nullable|date|after:today',
            'passengers.*.birth_date' => 'required|date|before:today',
            'passengers.*.gender' => 'required|in:male,female',
            'passengers.*.nationality' => 'nullable|string|max:50',
            'passengers.*.email' => 'nullable|email',
            'passengers.*.phone' => 'nullable|string|max:30',

            'applicant_data' => 'nullable|array',
            'applicant_data.address' => 'nullable|string|max:500',
            'applicant_data.job_title' => 'nullable|string|max:100',
            'applicant_data.company_name' => 'nullable|string|max:200',
        ];
    }

    public function messages(): array
    {
        return [
            'visa_slug.required' => 'شناسه ویزا الزامی است',
            'passengers.required' => 'حداقل یک مسافر باید مشخص شود',
            'passengers.*.first_name.required' => 'نام مسافر :position الزامی است',
            'passengers.*.last_name.required' => 'نام خانوادگی مسافر :position الزامی است',
            'passengers.*.birth_date.required' => 'تاریخ تولد مسافر :position الزامی است',
            'passengers.*.gender.required' => 'جنسیت مسافر :position الزامی است',
            'passengers.*.passport_expiry.after' => 'تاریخ انقضای پاسپورت مسافر :position باید بعد از امروز باشد',
        ];
    }
}
