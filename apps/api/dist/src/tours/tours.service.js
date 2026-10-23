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
exports.ToursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ToursService = class ToursService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, limit, destination, search, minPrice, maxPrice, startDateFrom, startDateTo } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: 'PUBLISHED'
        };
        if (destination) {
            where.destination = { slug: destination };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (startDateFrom || startDateTo || minPrice || maxPrice) {
            const dateFilter = {};
            if (startDateFrom)
                dateFilter.startDate = { gte: startDateFrom };
            if (startDateTo)
                dateFilter.startDate = { ...dateFilter.startDate, lte: startDateTo };
            if (minPrice)
                dateFilter.adultPrice = { gte: minPrice };
            if (maxPrice)
                dateFilter.adultPrice = { ...dateFilter.adultPrice, lte: maxPrice };
            where.dates = { some: dateFilter };
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.tour.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    destination: true,
                    category: true,
                    dates: {
                        where: { status: 'ACTIVE', startDate: { gte: new Date() } },
                        orderBy: { startDate: 'asc' },
                        take: 3,
                    },
                },
            }),
            this.prisma.tour.count({ where }),
        ]);
        return {
            success: true,
            data,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async findOneBySlug(slug) {
        const tour = await this.prisma.tour.findUnique({
            where: { slug, status: 'PUBLISHED' },
            include: {
                destination: true,
                category: true,
                dates: {
                    where: { status: 'ACTIVE', startDate: { gte: new Date() } },
                    orderBy: { startDate: 'asc' },
                },
                itineraries: { orderBy: { order: 'asc' } },
                services: true,
                hotelRelations: { include: { hotel: true } },
            },
        });
        if (!tour)
            throw new common_1.NotFoundException('Tour not found');
        return { success: true, data: tour };
    }
    async createLead(tourId, dto, source) {
        const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
        if (!tour)
            throw new common_1.NotFoundException('Tour not found');
        const lead = await this.prisma.lead.create({
            data: {
                leadType: 'TOUR',
                relatedTourId: tourId,
                customerName: dto.customerName,
                phone: dto.phone,
                email: dto.email,
                passengerCount: dto.passengerCount,
                preferredDate: dto.preferredDate,
                message: dto.message,
                source,
                status: 'NEW',
            },
        });
        return { success: true, data: { message: 'Request submitted successfully', leadId: lead.id } };
    }
};
exports.ToursService = ToursService;
exports.ToursService = ToursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ToursService);
//# sourceMappingURL=tours.service.js.map