import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../../ledger/services/ledger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async initiatePayment(orderId: string, userId: string, amount: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'DRAFT' && order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Order cannot be paid');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        status: 'INITIATED',
        gatewayName: 'MOCK_GATEWAY',
        idempotencyKey: uuidv4(),
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING_PAYMENT' },
    });

    // In production, redirect to payment gateway
    // For now, return mock gateway URL
    const gatewayUrl = `https://mock-gateway.example.com/pay?trackId=${payment.id}&amount=${amount}`;

    return {
      success: true,
      data: {
        paymentId: payment.id,
        gatewayUrl,
        amount,
      },
    };
  }

  async verifyPayment(paymentId: string, gatewayRefId: string, success: boolean) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'INITIATED' && payment.status !== 'PENDING_GATEWAY') {
      throw new BadRequestException('Payment already processed');
    }

    if (success) {
      // Update payment status
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESSFUL',
          gatewayRefId,
          paidAt: new Date(),
        },
      });

      // Update order status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });

      // Record transaction in ledger
      await this.ledger.recordTransaction({
        type: 'CREDIT',
        amount: payment.amount,
        userId: payment.order.userId,
        orderId: payment.orderId,
        paymentId,
        reason: 'Payment received',
        reference: gatewayRefId,
      });

      return {
        success: true,
        data: {
          paymentId,
          status: 'SUCCESSFUL',
          message: 'Payment verified successfully',
        },
      };
    } else {
      // Payment failed
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          gatewayRefId,
        },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'FAILED' },
      });

      return {
        success: true,
        data: {
          paymentId,
          status: 'FAILED',
          message: 'Payment failed',
        },
      };
    }
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      success: true,
      data: payment,
    };
  }
}
