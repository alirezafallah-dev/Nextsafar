<?php

namespace App\Modules\Payment\Console;

use App\Modules\Payment\Services\ExchangeService;
use Illuminate\Console\Command;

class RefreshExchangeRates extends Command
{
    protected $signature = 'exchange:refresh';
    protected $description = 'Refresh exchange rates from BrsApi';

    public function handle(): int
    {
        $this->info('🔄 Refreshing exchange rates...');

        $result = ExchangeService::refreshRates();

        if ($result['success']) {
            $this->info("✅ Success: {$result['count']} rates updated");
            
            $this->table(
                ['Currency', 'Rate (IRR)'],
                collect($result['rates'])->map(fn($rate, $code) => [
                    $code,
                    number_format($rate),
                ])
            );
            
            return Command::SUCCESS;
        }

        $this->error("❌ Failed: {$result['message']}");
        return Command::FAILURE;
    }
}
