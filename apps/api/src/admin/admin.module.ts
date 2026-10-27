import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { ReportsService } from '../reports/services/reports.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [AdminController],
  providers: [AdminService, ReportsService],
})
export class AdminModule {}
