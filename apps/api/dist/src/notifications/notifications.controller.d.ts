import { NotificationsService } from './services/notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(user: any, page?: string, limit?: string): Promise<{
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
}
