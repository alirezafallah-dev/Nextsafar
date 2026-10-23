import { Module } from '@nestjs/common';
import { WordpressSyncService } from './wordpress-sync.service';
import { WordpressSyncController } from './wordpress-sync.controller';

@Module({
  controllers: [WordpressSyncController],
  providers: [WordpressSyncService],
  exports: [WordpressSyncService],
})
export class WordpressSyncModule {}
