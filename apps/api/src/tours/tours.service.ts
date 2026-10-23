import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TourQueryDto } from './dto/tour-query.dto';
import { TourLeadDto } from './dto/tour-lead.dto';
import { Prisma } from '@nextsafar/db';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TourQueryDto) {
    const { page, limit, destination, search, minPrice, maxPrice, startDateFrom, startDateTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TourWhereInput = { 
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

    // Filter by price and dates using 'some' for array relations
    if (startDateFrom || startDateTo || minPrice || maxPrice) {
      const dateFilter: any = {};
      if (startDateFrom) dateFilter.startDate = { gte: startDateFrom };
      if (startDateTo) dateFilter.startDate = { ...dateFilter.startDate, lte: startDateTo };
      if (minPrice) dateFilter.adultPrice = { gte: minPrice };
      if (maxPrice) dateFilter.adultPrice = { ...dateFilter.adultPrice, lte: maxPrice };
      
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

  async findOneBySlug(slug: string) {
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

    if (!tour) throw new NotFoundException('Tour not found');
    return { success: true, data: tour };
  }

  async createLead(tourId: string, dto: TourLeadDto, source: string) {
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour not found');

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
}
