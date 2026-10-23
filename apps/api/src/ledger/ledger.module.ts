import { Module } from '@nestjs/common';
import { LedgerService } from './services/ledger.service';

@Module({
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
