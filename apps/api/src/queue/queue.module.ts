import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './workers/notification.processor';
import { AuditProcessor } from './workers/audit.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6380'),
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    BullModule.registerQueue({
      name: 'audit',
    }),
    BullModule.registerQueue({
      name: 'orders',
    }),
  ],
  providers: [QueueService, NotificationProcessor, AuditProcessor],
  exports: [QueueService],
})
export class QueueModule {}
