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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const uuid_1 = require("uuid");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(userId, dto) {
        if (dto.idempotencyKey) {
            const existingOrder = await this.prisma.order.findUnique({
                where: { idempotencyKey: dto.idempotencyKey },
            });
            if (existingOrder) {
                return {
                    success: true,
                    data: existingOrder,
                    meta: { message: 'Order already exists (idempotent)' },
                };
            }
        }
        let totalAmount = 0;
        dto.items.forEach(item => {
            totalAmount += item.unitPrice * item.quantity;
        });
        const discountAmount = 0;
        const finalAmount = totalAmount - discountAmount;
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    status: 'DRAFT',
                    totalAmount,
                    discountAmount,
                    finalAmount,
                    idempotencyKey: dto.idempotencyKey || (0, uuid_1.v4)(),
                    source: 'WEB',
                    notes: dto.notes,
                    items: {
                        create: dto.items.map(item => ({
                            itemType: item.itemType,
                            itemId: item.itemId,
                            itemName: item.itemName,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.unitPrice * item.quantity,
                        })),
                    },
                    passengers: {
                        create: dto.passengers.map(p => ({
                            firstName: p.firstName,
                            lastName: p.lastName,
                            nationalId: p.nationalId,
                            passportNumber: p.passportNumber,
                            birthDate: p.birthDate ? new Date(p.birthDate) : null,
                            gender: p.gender,
                            relationship: p.relationship,
                        })),
                    },
                    statusHistory: {
                        create: {
                            newStatus: 'DRAFT',
                            reason: 'Order created',
                        },
                    },
                },
                include: {
                    items: true,
                    passengers: true,
                },
            });
            return newOrder;
        });
        return {
            success: true,
            data: order,
        };
    }
    async getOrderById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                passengers: true,
                payments: true,
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
        };
    }
    async getUserOrders(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    passengers: true,
                    payments: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);
        return {
            success: true,
            data: orders,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async updateOrderStatus(orderId, newStatus, reason) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status: newStatus },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    oldStatus: order.status,
                    newStatus,
                    reason,
                },
            });
            return updated;
        });
        return {
            success: true,
            data: updatedOrder,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map