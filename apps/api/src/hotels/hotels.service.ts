import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelQueryDto } from './dto/hotel-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: HotelQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.HotelWhereInput = {
      publishStatus: 'PUBLISHED',
      displayStatus: true,
    };

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.country) {
      where.country = { contains: query.country, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.stars) {
      where.stars = query.stars;
    }

    if (query.minRating) {
      where.rating = { gte: query.minRating };
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
          featuredImage: true,
          galleryImages: true,
          rating: true,
          reviewsCount: true,
          stars: true,
          shortDescription: true,
          price: true,
          priceFormatted: true,
          currency: true,
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

  async findOneBySlug(slug: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { slug },
      include: {
        providerMappings: true,
        tourRelations: {
          include: { tour: true },
          where: { tour: { status: 'PUBLISHED' } },
        },
      },
    });

    if (!hotel) {
      // بررسی slug های قدیمی برای redirect
      const oldSlug = await this.prisma.hotelSlug.findUnique({ where: { slug } });
      if (oldSlug) {
        const redirectedHotel = await this.prisma.hotel.findUnique({ where: { id: oldSlug.hotelId } });
        if (redirectedHotel) {
          return {
            success: true,
            data: redirectedHotel,
            redirect: true,
            oldSlug: slug,
            newSlug: redirectedHotel.slug,
          };
        }
      }
      throw new NotFoundException(`Hotel with slug ${slug} not found`);
    }

    return {
      success: true,
      data: hotel,
    };
  }
}
