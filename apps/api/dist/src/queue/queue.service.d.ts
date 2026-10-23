import { Queue } from 'bullmq';
import { NotificationJobData, AuditLogJobData, OrderEventJobData } from './interfaces/queue-jobs.interface';
export declare class QueueService {
    private notificationsQueue;
    private auditQueue;
    private ordersQueue;
    constructor(notificationsQueue: Queue, auditQueue: Queue, ordersQueue: Queue);
    addNotification(data: NotificationJobData): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
    addAuditLog(data: AuditLogJobData): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
    addOrderEvent(data: OrderEventJobData): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
}
