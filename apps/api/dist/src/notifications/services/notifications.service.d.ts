import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
export declare class NotificationsService {
    private prisma;
    private queue;
    private readonly logger;
    constructor(prisma: PrismaService, queue: QueueService);
    sendNotification(params: {
        userId?: string;
        channel: 'SMS' | 'EMAIL' | 'INTERNAL' | 'WHATSAPP';
        recipient: string;
        subject?: string;
        template: string;
        data?: any;
    }): Promise<{
        success: boolean;
        data: {
            notificationId: string;
            status: string;
        };
    }>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            userId: string | null;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.NotificationStatus;
            errorMessage: string | null;
            channel: import("@prisma/client").$Enums.NotificationChannel;
            recipient: string;
            subject: string | null;
            template: string;
            attempts: number;
            sentAt: Date | null;
        }[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    processNotification(notificationId: string): Promise<void>;
    private sendSMS;
    private sendEmail;
    private sendWhatsApp;
}
