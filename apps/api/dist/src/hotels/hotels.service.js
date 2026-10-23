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
exports.HotelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HotelsService = class HotelsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page, limit, city, search } = query;
        const skip = (page - 1) * limit;
        const where = {
            publishStatus: 'PUBLISHED',
            displayStatus: true
        };
        if (city)
            where.city = city;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.hotel.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    city: true,
                    country: true,
                    images: true,
                    rating: true,
                    shortDescription: true,
                    seoTitle: true,
                    seoDescription: true,
                },
            }),
            this.prisma.hotel.count({ where }),
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
        const hotel = await this.prisma.hotel.findUnique({
            where: { slug, publishStatus: 'PUBLISHED', displayStatus: true },
        });
        if (!hotel) {
            const oldSlug = await this.prisma.hotelSlug.findUnique({ where: { slug } });
            if (oldSlug) {
                const redirectedHotel = await this.prisma.hotel.findUnique({ where: { id: oldSlug.hotelId } });
                if (redirectedHotel) {
                    return {
                        success: true,
                        data: redirectedHotel,
                        meta: { redirected: true, newSlug: redirectedHotel.slug }
                    };
                }
            }
            throw new common_1.NotFoundException('Hotel not found');
        }
        return { success: true, data: hotel };
    }
};
exports.HotelsService = HotelsService;
exports.HotelsService = HotelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HotelsService);
//# sourceMappingURL=hotels.service.js.map