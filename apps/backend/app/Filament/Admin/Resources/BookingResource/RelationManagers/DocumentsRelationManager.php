<?php

namespace App\Filament\Admin\Resources\BookingResource\RelationManagers;

use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Forms;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class DocumentsRelationManager extends RelationManager
{
    protected static string $relationship = 'documents';

    protected static ?string $title = 'مدارک';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                TextColumn::make('document_type')
                    ->label('نوع مدرک')
                    ->badge(),

                TextColumn::make('title')
                    ->label('عنوان')
                    ->searchable(),

                TextColumn::make('original_name')
                    ->label('نام فایل'),

                TextColumn::make('mime_type')
                    ->label('نوع فایل')
                    ->badge(),

                TextColumn::make('file_size')
                    ->label('حجم')
                    ->formatStateUsing(fn ($state) => number_format($state / 1024, 2) . ' KB'),

                TextColumn::make('status')
                    ->label('وضعیت')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'uploaded' => 'info',
                        'verified' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('uploaded_at')
                    ->label('تاریخ آپلود')
                    ->dateTime('Y/m/d H:i'),
            ])
            ->filters([])
            ->actions([
                Action::make('download')
                    ->label('دانلود')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn ($record) => $record->file_url)
                    ->openUrlInNewTab(),

                Action::make('verify')
                    ->label('تایید')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->action(fn ($record) => $record->update(['status' => 'verified']))
                    ->visible(fn ($record) => $record->status === 'uploaded'),

                Action::make('reject')
                    ->label('رد')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('دلیل رد')
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update([
                            'status' => 'rejected',
                            'rejection_reason' => $data['rejection_reason'],
                        ]);
                    })
                    ->visible(fn ($record) => $record->status === 'uploaded'),

                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
