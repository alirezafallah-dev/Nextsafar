import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueReport(startDate: Date, endDate: Date) {
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

    // Group by day
    const revenueByDay: Record<string, number> = {};
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

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.order.count({ where: { status: status as any } }),
      })),
    );

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

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.visaCase.count({ where: { status: status as any } }),
      })),
    );

    return {
      success: true,
      data: counts,
    };
  }

  async getTopDestinations(limit: number = 10) {
    const tours = await this.prisma.tour.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        destination: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    // Group by destination
    const destMap: Record<string, { name: string; tourCount: number; leadsCount: number }> = {};
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
}
