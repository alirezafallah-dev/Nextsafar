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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../../queue/queue.service");
let AdminService = class AdminService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async getDashboardStats() {
        const [totalUsers, totalOrders, totalRevenue, pendingOrders, activeVisaCases, totalHotels, totalTours, recentOrders, recentLeads,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { finalAmount: true },
            }),
            this.prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
            this.prisma.visaCase.count({
                where: {
                    status: {
                        notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'],
                    },
                },
            }),
            this.prisma.hotel.count({ where: { publishStatus: 'PUBLISHED' } }),
            this.prisma.tour.count({ where: { status: 'PUBLISHED' } }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: true },
            }),
            this.prisma.lead.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalOrders,
                    totalRevenue: totalRevenue._sum.finalAmount || 0,
                    pendingOrders,
                    activeVisaCases,
                    totalHotels,
                    totalTours,
                },
                recentOrders,
                recentLeads,
                generatedAt: new Date().toISOString(),
            },
        };
    }
    async getAllUsers(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    roles: { include: { role: true } },
                    _count: {
                        select: {
                            orders: true,
                            visaCases: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            success: true,
            data: users,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getAllOrders(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    items: true,
                    payments: true,
                },
            }),
            this.prisma.order.count({ where }),
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
    async getAllLeads(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [leads, total] = await this.prisma.$transaction([
            this.prisma.lead.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.lead.count({ where }),
        ]);
        return {
            success: true,
            data: leads,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getAllVisaCases(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [cases, total] = await this.prisma.$transaction([
            this.prisma.visaCase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    country: true,
                    _count: {
                        select: {
                            documents: true,
                            appointments: true,
                        },
                    },
                },
            }),
            this.prisma.visaCase.count({ where }),
        ]);
        return {
            success: true,
            data: cases,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async logAdminActivity(adminId, action, entityType, entityId, metadata, ip, userAgent) {
        await this.queue.addAuditLog({
            adminId,
            action,
            entityType,
            entityId,
            metadata,
            ip,
            userAgent,
        });
    }
    async getAdminActivityLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await this.prisma.$transaction([
            this.prisma.adminActivityLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.adminActivityLog.count(),
        ]);
        return {
            success: true,
            data: logs,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], AdminService);
//# sourceMappingURL=admin.service.js.map