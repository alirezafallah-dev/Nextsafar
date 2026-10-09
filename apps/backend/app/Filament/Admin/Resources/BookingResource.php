<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BookingResource\Pages;
use App\Filament\Admin\Resources\BookingResource\RelationManagers;
use App\Modules\Booking\Models\Booking;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationLabel = 'رزروها';
    protected static \UnitEnum|string|null $navigationGroup = 'مدیریت رزرو';
    protected static ?int $navigationSort = 1;
    protected static ?string $modelLabel = 'رزرو';
    protected static ?string $pluralModelLabel = 'رزروها';
    protected static ?string $slug = 'bookings';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('اطلاعات اصلی')
                    ->schema([
                        Forms\Components\TextInput::make('booking_code')
                            ->label('کد رزرو')
                            ->disabled()
                            ->columnSpan(1),

                        Forms\Components\Select::make('user_id')
                            ->label('کاربر')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->columnSpan(1),

                        Forms\Components\Select::make('booking_type')
                            ->label('نوع رزرو')
                            ->options([
                                'flight' => '✈️ پرواز',
                                'hotel' => '🏨 هتل',
                                'tour' => '🌍 تور',
                                'visa' => '🛂 ویزا',
                            ])
                            ->required()
                            ->columnSpan(1),

                        Forms\Components\Select::make('status')
                            ->label('وضعیت')
                            ->options([
                                'pending' => 'در انتظار',
                                'awaiting_payment' => 'در انتظار پرداخت',
                                'paid' => 'پرداخت شده',
                                'processing' => 'در حال پردازش',
                                'confirmed' => 'تایید شده',
                                'completed' => 'تکمیل شده',
                                'cancelled' => 'لغو شده',
                                'refunded' => 'مسترد شده',
                                'failed' => 'ناموفق',
                            ])
                            ->required()
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('item_title')
                            ->label('عنوان آیتم')
                            ->disabled()
                            ->columnSpan(2),
                    ])
                    ->columns(2),

                Section::make('اطلاعات مالی')
                    ->schema([
                        Forms\Components\TextInput::make('total_amount')
                            ->label('مبلغ کل')
                            ->numeric()
                            ->disabled()
                            ->prefix('IRR')
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('discount_amount')
                            ->label('تخفیف')
                            ->numeric()
                            ->disabled()
                            ->prefix('IRR')
                            ->columnSpan(1),

                        Forms\Components\TextInput::make('coupon_code')
                            ->label('کد تخفیف')
                            ->disabled()
                            ->columnSpan(1),

                        Forms\Components\DateTimePicker::make('paid_at')
                            ->label('تاریخ پرداخت')
                            ->disabled()
                            ->columnSpan(1),
                    ])
                    ->columns(2),

                Section::make('یادداشت‌ها')
                    ->schema([
                        Forms\Components\Textarea::make('notes')
                            ->label('یادداشت کاربر')
                            ->rows(3)
                            ->columnSpan(1),

                        Forms\Components\Textarea::make('admin_notes')
                            ->label('یادداشت ادمین')
                            ->rows(3)
                            ->columnSpan(1),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('booking_code')
                    ->label('کد رزرو')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('primary'),

                TextColumn::make('user.name')
                    ->label('کاربر')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('booking_type')
                    ->label('نوع')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'flight' => '✈️ پرواز',
                        'hotel' => '🏨 هتل',
                        'tour' => '🌍 تور',
                        'visa' => '🛂 ویزا',
                        default => $state,
                    })
                    ->color(fn ($state) => match($state) {
                        'flight' => 'info',
                        'hotel' => 'success',
                        'tour' => 'warning',
                        'visa' => 'primary',
                        default => 'gray',
                    }),

                TextColumn::make('item_title')
                    ->label('عنوان')
                    ->limit(30)
                    ->searchable(),

                TextColumn::make('status')
                    ->label('وضعیت')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => 'در انتظار',
                        'awaiting_payment' => 'در انتظار پرداخت',
                        'paid' => 'پرداخت شده',
                        'processing' => 'در حال پردازش',
                        'confirmed' => 'تایید شده',
                        'completed' => 'تکمیل شده',
                        'cancelled' => 'لغو شده',
                        'refunded' => 'مسترد شده',
                        'failed' => 'ناموفق',
                        default => $state,
                    })
                    ->color(fn ($state) => match($state) {
                        'pending' => 'gray',
                        'awaiting_payment' => 'warning',
                        'paid' => 'info',
                        'processing' => 'warning',
                        'confirmed' => 'success',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'refunded' => 'info',
                        'failed' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('total_amount')
                    ->label('مبلغ')
                    ->money('IRR')
                    ->sortable(),

                TextColumn::make('passenger_count')
                    ->label('مسافران')
                    ->badge()
                    ->color('info'),

                TextColumn::make('created_at')
                    ->label('تاریخ ایجاد')
                    ->dateTime('Y/m/d H:i')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('booking_type')
                    ->label('نوع رزرو')
                    ->options([
                        'flight' => 'پرواز',
                        'hotel' => 'هتل',
                        'tour' => 'تور',
                        'visa' => 'ویزا',
                    ]),

                SelectFilter::make('status')
                    ->label('وضعیت')
                    ->options([
                        'pending' => 'در انتظار',
                        'awaiting_payment' => 'در انتظار پرداخت',
                        'paid' => 'پرداخت شده',
                        'confirmed' => 'تایید شده',
                        'completed' => 'تکمیل شده',
                        'cancelled' => 'لغو شده',
                    ]),

                Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('از تاریخ'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('تا تاریخ'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                ViewAction::make(),
                Action::make('confirm')
                    ->label('تایید')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Booking $record) {
                        $record->update(['status' => 'confirmed', 'confirmed_at' => now()]);
                    })
                    ->visible(fn (Booking $record) => in_array($record->status, ['paid', 'processing'])),

                Action::make('cancel')
                    ->label('لغو')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->label('دلیل لغو')
                            ->required(),
                    ])
                    ->action(function (Booking $record, array $data) {
                        $record->update([
                            'status' => 'cancelled',
                            'cancelled_at' => now(),
                            'cancellation_reason' => $data['cancellation_reason'],
                        ]);
                    })
                    ->visible(fn (Booking $record) => !in_array($record->status, ['cancelled', 'completed', 'refunded'])),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\PassengersRelationManager::class,
            RelationManagers\DocumentsRelationManager::class,
            RelationManagers\PaymentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'view' => Pages\ViewBooking::route('/{record}'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::whereIn('status', ['pending', 'awaiting_payment', 'processing'])->count();
        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): string
    {
        return 'warning';
    }
}
