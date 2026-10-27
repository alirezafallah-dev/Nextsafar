import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Check idempotency
    if (dto.idempotencyKey) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existingOrder) {
        return {
          success: true,
          data: existingOrder,
          meta: { message: 'Order already exists (idempotent)' },
        };
      }
    }

    // Calculate totals
    let totalAmount = 0;
    dto.items.forEach(item => {
      totalAmount += item.unitPrice * item.quantity;
    });

    const discountAmount = 0; // TODO: Apply discount code logic
    const finalAmount = totalAmount - discountAmount;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'DRAFT',
          totalAmount,
          discountAmount,
          finalAmount,
          idempotencyKey: dto.idempotencyKey || uuidv4(),
          source: 'WEB',
          notes: dto.notes,
          items: {
            create: dto.items.map(item => ({
              itemType: item.itemType,
              itemId: item.itemId,
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
          passengers: {
            create: dto.passengers.map(p => ({
              firstName: p.firstName,
              lastName: p.lastName,
              nationalId: p.nationalId,
              passportNumber: p.passportNumber,
              birthDate: p.birthDate ? new Date(p.birthDate) : null,
              gender: p.gender,
              relationship: p.relationship,
            })),
          },
          statusHistory: {
            create: {
              newStatus: 'DRAFT',
              reason: 'Order created',
            },
          },
        },
        include: {
          items: true,
          passengers: true,
        },
      });

      return newOrder;
    });

    return {
      success: true,
      data: order,
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        passengers: true,
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          passengers: true,
          payments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
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

  async updateOrderStatus(orderId: string, newStatus: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: order.status,
          newStatus,
          reason,
        },
      });

      return updated;
    });

    return {
      success: true,
      data: updatedOrder,
    };
  }
}
