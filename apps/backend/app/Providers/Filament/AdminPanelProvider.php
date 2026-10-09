<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            
            // رنگ اصلی: نارنجی سفارشی (#fba834)
            ->colors([
                'primary' => [
                    50 => '#fef9f0',
                    100 => '#fdf0d9',
                    200 => '#fbe0b2',
                    300 => '#f9ca81',
                    400 => '#f7b250',
                    500 => '#fba834',  // رنگ اصلی
                    600 => '#e8921f',
                    700 => '#c6771a',
                    800 => '#a15e1a',
                    900 => '#824d19',
                    950 => '#46260b',
                ],
                'danger' => Color::Red,
                'warning' => Color::Orange,
                'success' => Color::Green,
                'info' => Color::Blue,
                'gray' => Color::Zinc,
            ])
            
            // RTL mode
            ->spa()
            ->sidebarCollapsibleOnDesktop()
            
            // Theme CSS
            ->theme('filament-custom')
            
            ->discoverResources(in: app_path('Filament/Admin/Resources'), for: 'App\\Filament\\Admin\\Resources')
            ->discoverPages(in: app_path('Filament/Admin/Pages'), for: 'App\\Filament\\Admin\\Pages')
            ->discoverWidgets(in: app_path('Filament/Admin/Widgets'), for: 'App\\Filament\\Admin\\Widgets')
            ->pages([
                \Filament\Pages\Dashboard::class,
            ])
            ->widgets([
                \Filament\Widgets\AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
