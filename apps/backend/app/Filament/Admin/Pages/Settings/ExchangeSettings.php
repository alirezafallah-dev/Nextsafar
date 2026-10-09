<?php

namespace App\Filament\Admin\Pages\Settings;

use App\Modules\Payment\Models\ExchangeSetting;
use App\Modules\Payment\Services\ExchangeService;
use Filament\Actions\Action;
use Filament\Forms\Components\KeyValue;        // ✅ در Forms باقی مانده
use Filament\Forms\Components\TextInput;      // ✅ در Forms باقی مانده
use Filament\Forms\Components\Toggle;         // ✅ در Forms باقی مانده
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;      // ✅ منتقل شده به Schemas
use Filament\Schemas\Schema;

/**
 * صفحه تنظیمات نرخ ارز (صرافی)
 * سازگار با Filament v5.x
 */
class ExchangeSettings extends Page implements HasForms
{
    use InteractsWithForms;

    /*
    |--------------------------------------------------------------------------
    | Properties
    |--------------------------------------------------------------------------
    */

    protected string $view = 'filament.admin.pages.settings.exchange-settings';

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-currency-dollar';
    protected static ?string $navigationLabel = 'تنظیمات صرافی';
    protected static \UnitEnum|string|null $navigationGroup = 'تنظیمات';
    protected static ?int $navigationSort = 1;
    protected static ?string $title = 'تنظیمات نرخ ارز';
    protected static ?string $slug = 'settings/exchange';

    public ?array $data = [];

    /*
    |--------------------------------------------------------------------------
    | Lifecycle
    |--------------------------------------------------------------------------
    */

    public function mount(): void
    {
        $settings = ExchangeSetting::getCurrent();
        
        $this->form->fill([
            'api_key' => $settings->api_key,
            'use_live_rates' => $settings->use_live_rates,
            'cache_duration' => $settings->cache_duration,
            'manual_rates' => $this->formatManualRates($settings->manual_rates ?? []),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Schema (قبلاً Form در Filament v3/v4)
    |--------------------------------------------------------------------------
    */

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('تنظیمات API')
                    ->description('اتصال به BrsApi.ir برای دریافت نرخ زنده ارز')
                    ->schema([
                        TextInput::make('api_key')
                            ->label('کلید API')
                            ->password()
                            ->revealable()
                            ->placeholder('کلید API خود را وارد کنید')
                            ->helperText('از سایت brsapi.ir دریافت کنید')
                            ->maxLength(255),

                        Toggle::make('use_live_rates')
                            ->label('استفاده از نرخ زنده')
                            ->helperText('اگر فعال باشد، نرخ‌ها از API دریافت می‌شوند.')
                            ->default(true),

                        TextInput::make('cache_duration')
                            ->label('مدت کش (ثانیه)')
                            ->numeric()
                            ->minValue(60)
                            ->maxValue(86400)
                            ->default(3600)
                            ->helperText('پیش‌فرض: 3600 ثانیه (1 ساعت)'),
                    ])
                    ->columns(2),

                Section::make('نرخ‌های دستی (Fallback)')
                    ->description('این نرخ‌ها زمانی استفاده می‌شوند که API در دسترس نباشد')
                    ->schema([
                        KeyValue::make('manual_rates')
                            ->label('نرخ ارزها (به ریال)')
                            ->keyLabel('کد ارز')
                            ->valueLabel('نرخ (ریال)')
                            ->addActionLabel('افزودن ارز جدید')
                            ->helperText('مثال: USD = 600000 یعنی 1 دلار = 600,000 ریال')
                            ->reorderable()
                            ->columnSpan('full'),
                    ]),
            ])
            ->statePath('data');
    }

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    protected function getHeaderActions(): array
    {
        return [
            Action::make('refresh_rates')
                ->label('بروزرسانی نرخ‌ها')
                ->color('success')
                ->icon('heroicon-o-arrow-path')
                ->action('refreshRates')
                ->requiresConfirmation()
                ->modalHeading('بروزرسانی نرخ ارز')
                ->modalDescription('آیا مطمئن هستید که می‌خواهید نرخ‌ها را از API بروزرسانی کنید؟')
                ->modalSubmitActionLabel('بله، بروزرسانی کن'),

            Action::make('save')
                ->label('ذخیره تنظیمات')
                ->color('primary')
                ->icon('heroicon-o-check')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $settings = ExchangeSetting::getCurrent();

        $manualRates = [];
        foreach ($data['manual_rates'] ?? [] as $code => $rate) {
            $code = strtoupper(trim($code));
            $rate = (float) str_replace([',', '،'], '', $rate);
            if ($code && $rate > 0) {
                $manualRates[$code] = $rate;
            }
        }

        $settings->update([
            'api_key' => $data['api_key'] ?? null,
            'use_live_rates' => $data['use_live_rates'] ?? true,
            'cache_duration' => (int) ($data['cache_duration'] ?? 3600),
            'manual_rates' => $manualRates,
        ]);

        ExchangeService::clearCache();

        Notification::make()
            ->title('تنظیمات ذخیره شد')
            ->body('تنظیمات صرافی با موفقیت ذخیره شد.')
            ->success()
            ->send();
    }

    public function refreshRates(): void
    {
        $result = ExchangeService::refreshRates();

        if ($result['success']) {
            Notification::make()
                ->title('نرخ‌ها بروزرسانی شدند')
                ->body("{$result['count']} ارز با موفقیت بروزرسانی شد.")
                ->success()
                ->send();
        } else {
            Notification::make()
                ->title('خطا در بروزرسانی')
                ->body($result['message'])
                ->danger()
                ->send();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function formatManualRates(array $rates): array
    {
        $formatted = [];
        foreach ($rates as $code => $rate) {
            $formatted[$code] = number_format($rate, 0, '.', '');
        }
        return $formatted;
    }

    protected function getViewData(): array
    {
        $settings = ExchangeSetting::getCurrent();
        $currentRates = ExchangeService::getExchangeRates();

        return [
            'currentRates' => $currentRates,
            'lastUpdated' => $settings->last_updated_at,
            'supportedCurrencies' => ExchangeService::getSupportedCurrencies(),
        ];
    }
}
