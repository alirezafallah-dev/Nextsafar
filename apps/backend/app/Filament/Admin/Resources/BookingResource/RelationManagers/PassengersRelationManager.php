<?php

namespace App\Filament\Admin\Resources\BookingResource\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\BulkActionGroup;
use Filament\Forms;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PassengersRelationManager extends RelationManager
{
    protected static string $relationship = 'passengers';

    protected static ?string $title = 'مسافران';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('passenger_type')
                    ->label('نوع مسافر')
                    ->options([
                        'adult' => 'بزرگسال',
                        'child' => 'کودک',
                        'infant' => 'نوزاد',
                    ])
                    ->required(),

                Forms\Components\TextInput::make('first_name')
                    ->label('نام (انگلیسی)')
                    ->required()
                    ->maxLength(100),

                Forms\Components\TextInput::make('last_name')
                    ->label('نام خانوادگی (انگلیسی)')
                    ->required()
                    ->maxLength(100),

                Forms\Components\TextInput::make('first_name_fa')
                    ->label('نام (فارسی)')
                    ->maxLength(100),

                Forms\Components\TextInput::make('last_name_fa')
                    ->label('نام خانوادگی (فارسی)')
                    ->maxLength(100),

                Forms\Components\TextInput::make('passport_number')
                    ->label('شماره پاسپورت')
                    ->maxLength(50),

                Forms\Components\DatePicker::make('passport_expiry')
                    ->label('تاریخ انقضای پاسپورت'),

                Forms\Components\DatePicker::make('birth_date')
                    ->label('تاریخ تولد')
                    ->required(),

                Forms\Components\Select::make('gender')
                    ->label('جنسیت')
                    ->options([
                        'male' => 'مرد',
                        'female' => 'زن',
                    ])
                    ->required(),

                Forms\Components\TextInput::make('national_id')
                    ->label('کد ملی')
                    ->maxLength(20),

                Forms\Components\TextInput::make('phone')
                    ->label('تلفن')
                    ->tel()
                    ->maxLength(30),

                Forms\Components\TextInput::make('email')
                    ->label('ایمیل')
                    ->email()
                    ->maxLength(255),
            ])
            ->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('first_name')
            ->columns([
                TextColumn::make('passenger_type')
                    ->label('نوع')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'adult' => 'بزرگسال',
                        'child' => 'کودک',
                        'infant' => 'نوزاد',
                        default => $state,
                    }),

                TextColumn::make('first_name')
                    ->label('نام')
                    ->searchable(),

                TextColumn::make('last_name')
                    ->label('نام خانوادگی')
                    ->searchable(),

                TextColumn::make('passport_number')
                    ->label('پاسپورت')
                    ->searchable(),

                TextColumn::make('birth_date')
                    ->label('تاریخ تولد')
                    ->date('Y/m/d'),

                TextColumn::make('gender')
                    ->label('جنسیت')
                    ->formatStateUsing(fn ($state) => $state === 'male' ? 'مرد' : 'زن'),

                TextColumn::make('phone')
                    ->label('تلفن'),
            ])
            ->filters([])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
