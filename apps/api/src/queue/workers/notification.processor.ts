import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`🔄 Processing notification job ${job.id}`);
    const { notificationId, channel, recipient, template } = job.data;
    
    try {
      // Simulate sending based on channel
      switch (channel) {
        case 'SMS':
          this.logger.log(`📱 [MOCK SMS] To: ${recipient}, Template: ${template}`);
          break;
        case 'EMAIL':
          this.logger.log(`📧 [MOCK EMAIL] To: ${recipient}, Template: ${template}`);
          break;
        case 'INTERNAL':
          this.logger.log(`🔔 [INTERNAL] Notification stored in DB`);
          break;
        case 'WHATSAPP':
          this.logger.log(`💬 [MOCK WHATSAPP] To: ${recipient}, Template: ${template}`);
          break;
      }

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      this.logger.log(`✅ Notification sent: ${notificationId}`);
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          attempts: { increment: 1 },
        },
      });

      this.logger.error(`❌ Notification failed: ${notificationId}`, error);
      throw error;
    }
  }
}
