import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TourQueryDto } from './dto/tour-query.dto';
import { TourLeadDto } from './dto/tour-lead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TourQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TourWhereInput = { 
      status: 'PUBLISHED' 
    };
    
    if (query.destination) {
      where.destination = { slug: query.destination };
    }
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.dates = {
        some: {
          status: 'ACTIVE',
          adultPrice: {
            ...(query.minPrice && { gte: query.minPrice }),
            ...(query.maxPrice && { lte: query.maxPrice }),
          },
        },
      };
    }

    if (query.startDateFrom || query.startDateTo) {
      where.dates = {
        some: {
          status: 'ACTIVE',
          startDate: {
            ...(query.startDateFrom && { gte: new Date(query.startDateFrom) }),
            ...(query.startDateTo && { lte: new Date(query.startDateTo) }),
          },
        },
      };
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
            where: {
              status: 'ACTIVE',
              startDate: { gte: new Date() },
            },
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
      where: { slug },
      include: {
        destination: true,
        category: true,
        dates: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'asc' },
        },
        itineraries: { orderBy: { dayNumber: 'asc' } },
        services: true,
        hotelRelations: {
          include: { hotel: true },
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with slug ${slug} not found`);
    }

    return {
      success: true,
      data: tour,
    };
  }

  async createLead(tourId: string, dto: TourLeadDto, source: string) {
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) {
      throw new NotFoundException(`Tour with id ${tourId} not found`);
    }

    const lead = await this.prisma.lead.create({
      data: {
        leadType: 'TOUR',
        relatedTourId: tourId,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email,
        message: dto.message,
        passengerCount: dto.passengerCount,
        source,
        status: 'NEW',
      },
    });

    return {
      success: true,
      data: lead,
      message: 'Lead created successfully',
    };
  }
}
