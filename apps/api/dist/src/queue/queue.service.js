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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let QueueService = class QueueService {
    constructor(notificationsQueue, auditQueue, ordersQueue) {
        this.notificationsQueue = notificationsQueue;
        this.auditQueue = auditQueue;
        this.ordersQueue = ordersQueue;
    }
    async addNotification(data) {
        return this.notificationsQueue.add('send', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });
    }
    async addAuditLog(data) {
        return this.auditQueue.add('log', data);
    }
    async addOrderEvent(data) {
        return this.ordersQueue.add('process', data);
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('notifications')),
    __param(1, (0, bullmq_1.InjectQueue)('audit')),
    __param(2, (0, bullmq_1.InjectQueue)('orders')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], QueueService);
//# sourceMappingURL=queue.service.js.map