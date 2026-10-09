<x-filament-panels::page>
    <div class="space-y-6">
        {{-- کارت‌های وضعیت --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 dark:text-gray-400">وضعیت</div>
                <div class="text-2xl font-bold mt-1">
                    @if($lastUpdated)
                        <span class="text-green-600">✅ فعال</span>
                    @else
                        <span class="text-yellow-600">⚠️ تنظیم نشده</span>
                    @endif
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 dark:text-gray-400">آخرین بروزرسانی</div>
                <div class="text-lg font-semibold mt-1">
                    {{ $lastUpdated ? $lastUpdated->diffForHumans() : 'هرگز' }}
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div class="text-sm text-gray-500 dark:text-gray-400">تعداد ارزها</div>
                <div class="text-2xl font-bold mt-1">{{ count($currentRates) }}</div>
            </div>
        </div>

        {{-- جدول نرخ‌های فعلی --}}
        @if(!empty($currentRates))
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        💱 نرخ‌های فعلی ارز
                    </h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ارز</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کد</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نرخ (ریال)</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معادل تومان</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            @foreach($currentRates as $code => $rate)
                                <tr>
                                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                        {{ $supportedCurrencies[$code] ?? $code }}
                                    </td>
                                    <td class="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                                        {{ $code }}
                                    </td>
                                    <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                        {{ number_format($rate) }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {{ number_format($rate / 10) }} تومان
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @endif

        {{-- فرم تنظیمات --}}
        <form wire:submit="save">
            {{ $this->form }}
        </form>
    </div>
</x-filament-panels::page>
