import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationJobData, AuditLogJobData, OrderEventJobData } from './interfaces/queue-jobs.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('audit') private auditQueue: Queue,
    @InjectQueue('orders') private ordersQueue: Queue,
  ) {}

  async addNotification(data: NotificationJobData) {
    return this.notificationsQueue.add('send', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async addAuditLog(data: AuditLogJobData) {
    return this.auditQueue.add('log', data);
  }

  async addOrderEvent(data: OrderEventJobData) {
    return this.ordersQueue.add('process', data);
  }
}
