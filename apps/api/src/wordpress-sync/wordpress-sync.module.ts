import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WordpressSyncService } from './wordpress-sync.service';
import { WordpressSyncController } from './wordpress-sync.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WordpressSyncController],
  providers: [WordpressSyncService],
  exports: [WordpressSyncService],
})
export class WordpressSyncModule {}
