import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}

  async sendNotification(params: {
    userId?: string;
    channel: 'SMS' | 'EMAIL' | 'INTERNAL' | 'WHATSAPP';
    recipient: string;
    subject?: string;
    template: string;
    data?: any;
  }) {
    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        channel: params.channel,
        recipient: params.recipient,
        subject: params.subject,
        template: params.template,
        data: params.data,
        status: 'PENDING',
      },
    });

    // Add to queue for async processing
    await this.queue.addNotification({
      ...params,
      notificationId: notification.id,
    });

    this.logger.log(`📤 Notification queued: ${params.channel} to ${params.recipient}`);

    return {
      success: true,
      data: {
        notificationId: notification.id,
        status: 'QUEUED',
      },
    };
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      success: true,
      data: notifications,
      meta: {
        page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async processNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    try {
      // Simulate sending based on channel
      switch (notification.channel) {
        case 'SMS':
          await this.sendSMS(notification.recipient, notification.template, notification.data);
          break;
        case 'EMAIL':
          await this.sendEmail(notification.recipient, notification.subject, notification.template, notification.data);
          break;
        case 'INTERNAL':
          // Already in DB, just mark as sent
          break;
        case 'WHATSAPP':
          await this.sendWhatsApp(notification.recipient, notification.template, notification.data);
          break;
      }

      // Update status
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

  private async sendSMS(phone: string, template: string, data: any) {
    // Mock SMS provider
    this.logger.log(`📱 [MOCK SMS] To: ${phone}, Template: ${template}, Data:`, data);
    // In production: integrate with Kavenegar, SMS.ir, etc.
  }

  private async sendEmail(email: string, subject: string | null, template: string, data: any) {
    // Mock Email provider
    this.logger.log(`📧 [MOCK EMAIL] To: ${email}, Subject: ${subject}, Template: ${template}`);
    // In production: use nodemailer with SMTP/SendGrid/SES
  }

  private async sendWhatsApp(phone: string, template: string, data: any) {
    // Mock WhatsApp provider
    this.logger.log(`💬 [MOCK WHATSAPP] To: ${phone}, Template: ${template}`);
  }
}
