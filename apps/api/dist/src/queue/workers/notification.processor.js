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
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`🔄 Processing notification job ${job.id}`);
        const { notificationId, channel, recipient, template } = job.data;
        try {
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
};
exports.NotificationProcessor = NotificationProcessor;
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('notifications'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map