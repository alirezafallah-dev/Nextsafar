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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRevenueReport(startDate, endDate) {
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'PAID',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                items: true,
            },
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const revenueByDay = {};
        orders.forEach(order => {
            const day = order.createdAt.toISOString().split('T')[0];
            revenueByDay[day] = (revenueByDay[day] || 0) + order.finalAmount;
        });
        return {
            success: true,
            data: {
                period: { start: startDate, end: endDate },
                totalRevenue,
                totalOrders,
                averageOrderValue,
                revenueByDay,
            },
        };
    }
    async getOrdersByStatusReport() {
        const statuses = [
            'DRAFT',
            'PENDING_PAYMENT',
            'PAID',
            'BOOKING_REQUESTED',
            'ISSUED',
            'FAILED',
            'CANCELLED',
            'REFUND_REQUESTED',
            'REFUNDED',
        ];
        const counts = await Promise.all(statuses.map(async (status) => ({
            status,
            count: await this.prisma.order.count({ where: { status: status } }),
        })));
        return {
            success: true,
            data: counts,
        };
    }
    async getVisaReport() {
        const statuses = [
            'INITIAL',
            'DOCUMENTS_INCOMPLETE',
            'DOCUMENTS_COMPLETE',
            'UNDER_REVIEW',
            'SUBMITTED',
            'IN_PROCESS',
            'APPROVED',
            'REJECTED',
            'COMPLETED',
            'CANCELLED',
        ];
        const counts = await Promise.all(statuses.map(async (status) => ({
            status,
            count: await this.prisma.visaCase.count({ where: { status: status } }),
        })));
        return {
            success: true,
            data: counts,
        };
    }
    async getTopDestinations(limit = 10) {
        const tours = await this.prisma.tour.findMany({
            where: { status: 'PUBLISHED' },
            include: {
                destination: true,
                _count: {
                    select: { leads: true },
                },
            },
        });
        const destMap = {};
        tours.forEach(tour => {
            if (tour.destination) {
                const key = tour.destination.slug;
                if (!destMap[key]) {
                    destMap[key] = {
                        name: tour.destination.name,
                        tourCount: 0,
                        leadsCount: 0,
                    };
                }
                destMap[key].tourCount++;
                destMap[key].leadsCount += tour._count.leads;
            }
        });
        const top = Object.values(destMap)
            .sort((a, b) => b.leadsCount - a.leadsCount)
            .slice(0, limit);
        return {
            success: true,
            data: top,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map