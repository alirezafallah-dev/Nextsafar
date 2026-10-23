"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../../queue/queue.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendNotification(params) {
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
    async getUserNotifications(userId, page = 1, limit = 20) {
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
    async processNotification(notificationId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        try {
            switch (notification.channel) {
                case 'SMS':
                    await this.sendSMS(notification.recipient, notification.template, notification.data);
                    break;
                case 'EMAIL':
                    await this.sendEmail(notification.recipient, notification.subject, notification.template, notification.data);
                    break;
                case 'INTERNAL':
                    break;
                case 'WHATSAPP':
                    await this.sendWhatsApp(notification.recipient, notification.template, notification.data);
                    break;
            }
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    attempts: { increment: 1 },
                },
            });
            this.logger.log(`✅ Notification sent: ${notificationId}`);
        }
        catch (error) {
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
    async sendSMS(phone, template, data) {
        this.logger.log(`📱 [MOCK SMS] To: ${phone}, Template: ${template}, Data:`, data);
    }
    async sendEmail(email, subject, template, data) {
        this.logger.log(`📧 [MOCK EMAIL] To: ${email}, Subject: ${subject}, Template: ${template}`);
    }
    async sendWhatsApp(phone, template, data) {
        this.logger.log(`💬 [MOCK WHATSAPP] To: ${phone}, Template: ${template}`);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map