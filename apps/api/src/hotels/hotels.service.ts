import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelQueryDto } from './dto/hotel-query.dto';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: HotelQueryDto) {
    const { page, limit, city, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { 
      publishStatus: 'PUBLISHED',
      displayStatus: true 
    };
    
    if (city) where.city = city;
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

  async findOneBySlug(slug: string) {
    // تلاش برای پیدا کردن هتل با اسلاگ فعلی
    const hotel = await this.prisma.hotel.findUnique({
      where: { slug, publishStatus: 'PUBLISHED', displayStatus: true },
    });

    if (!hotel) {
      // اگر پیدا نشد، بررسی می‌کنیم که آیا این اسلاگ، یک اسلاگ قدیمی (تغییر یافته) است؟
      const oldSlug = await this.prisma.hotelSlug.findUnique({ where: { slug } });
      if (oldSlug) {
        const redirectedHotel = await this.prisma.hotel.findUnique({ where: { id: oldSlug.hotelId } });
        if (redirectedHotel) {
           // بازگرداندن هتل جدید با یک متادیتای خاص برای اطلاع فرانت‌اند جهت ریدایرکت 301
           return { 
             success: true, 
             data: redirectedHotel, 
             meta: { redirected: true, newSlug: redirectedHotel.slug } 
           };
        }
      }
      throw new NotFoundException('Hotel not found');
    }

    return { success: true, data: hotel };
  }
}
