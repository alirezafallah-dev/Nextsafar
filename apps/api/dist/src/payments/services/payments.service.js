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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../../ledger/services/ledger.service");
const uuid_1 = require("uuid");
let PaymentsService = class PaymentsService {
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async initiatePayment(orderId, userId, amount) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (order.status !== 'DRAFT' && order.status !== 'PENDING_PAYMENT') {
            throw new common_1.BadRequestException('Order cannot be paid');
        }
        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                amount,
                status: 'INITIATED',
                gatewayName: 'MOCK_GATEWAY',
                idempotencyKey: (0, uuid_1.v4)(),
            },
        });
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PENDING_PAYMENT' },
        });
        const gatewayUrl = `https://mock-gateway.example.com/pay?trackId=${payment.id}&amount=${amount}`;
        return {
            success: true,
            data: {
                paymentId: payment.id,
                gatewayUrl,
                amount,
            },
        };
    }
    async verifyPayment(paymentId, gatewayRefId, success) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true },
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        if (payment.status !== 'INITIATED' && payment.status !== 'PENDING_GATEWAY') {
            throw new common_1.BadRequestException('Payment already processed');
        }
        if (success) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'SUCCESSFUL',
                    gatewayRefId,
                    paidAt: new Date(),
                },
            });
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'PAID' },
            });
            await this.ledger.recordTransaction({
                type: 'CREDIT',
                amount: payment.amount,
                userId: payment.order.userId,
                orderId: payment.orderId,
                paymentId,
                reason: 'Payment received',
                reference: gatewayRefId,
            });
            return {
                success: true,
                data: {
                    paymentId,
                    status: 'SUCCESSFUL',
                    message: 'Payment verified successfully',
                },
            };
        }
        else {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'FAILED',
                    gatewayRefId,
                },
            });
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'FAILED' },
            });
            return {
                success: true,
                data: {
                    paymentId,
                    status: 'FAILED',
                    message: 'Payment failed',
                },
            };
        }
    }
    async getPaymentStatus(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true },
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        return {
            success: true,
            data: payment,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map