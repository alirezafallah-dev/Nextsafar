<?php

namespace App\Filament\Admin\Resources\BookingResource\RelationManagers;

use Filament\Actions\ViewAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PaymentsRelationManager extends RelationManager
{
    protected static string $relationship = 'payments';

    protected static ?string $title = 'پرداخت‌ها';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('transaction_id')
            ->columns([
                TextColumn::make('transaction_id')
                    ->label('شناسه تراکنش')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('gateway')
                    ->label('درگاه')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'zarinpal' => 'زرین‌پال',
                        'idpay' => 'آیدی‌پی',
                        'wallet' => 'کیف پول',
                        'manual' => 'دستی',
                        default => $state,
                    }),

                TextColumn::make('amount')
                    ->label('مبلغ')
                    ->money('IRR'),

                TextColumn::make('status')
                    ->label('وضعیت')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => 'در انتظار',
                        'redirecting' => 'در حال انتقال',
                        'success' => 'موفق',
                        'failed' => 'ناموفق',
                        'cancelled' => 'لغو شده',
                        'refunded' => 'مسترد شده',
                        default => $state,
                    })
                    ->color(fn ($state) => match($state) {
                        'pending' => 'gray',
                        'redirecting' => 'warning',
                        'success' => 'success',
                        'failed' => 'danger',
                        'cancelled' => 'info',
                        'refunded' => 'info',
                        default => 'gray',
                    }),

                TextColumn::make('reference_id')
                    ->label('شناسه مرجع')
                    ->limit(15),

                TextColumn::make('card_number')
                    ->label('شماره کارت')
                    ->limit(19),

                TextColumn::make('paid_at')
                    ->label('تاریخ پرداخت')
                    ->dateTime('Y/m/d H:i'),

                TextColumn::make('created_at')
                    ->label('تاریخ ایجاد')
                    ->dateTime('Y/m/d H:i'),
            ])
            ->filters([])
            ->actions([
                ViewAction::make(),
            ])
            ->bulkActions([]);
    }
}
