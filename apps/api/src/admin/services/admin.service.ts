import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeVisaCases,
      totalHotels,
      totalTours,
      recentOrders,
      recentLeads,
    ] = await Promise.all([
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

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

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

  async getAllOrders(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

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

  async getAllLeads(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

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

  async getAllVisaCases(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

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

  async logAdminActivity(
    adminId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: any,
    ip?: string,
    userAgent?: string,
  ) {
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

  async getAdminActivityLogs(page: number = 1, limit: number = 50) {
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
}
