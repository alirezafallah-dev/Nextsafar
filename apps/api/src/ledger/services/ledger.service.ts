import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async recordTransaction(params: {
    type: 'DEBIT' | 'CREDIT' | 'REFUND' | 'ADJUSTMENT';
    amount: number;
    userId: string;
    orderId?: string;
    paymentId?: string;
    reason: string;
    reference?: string;
  }) {
    const transaction = await this.prisma.transaction.create({
      data: {
        type: params.type,
        amount: params.amount,
        userId: params.userId,
        orderId: params.orderId,
        paymentId: params.paymentId,
        reason: params.reason,
        reference: params.reference,
      },
    });

    return {
      success: true,
      data: transaction,
    };
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: true,
          payment: true,
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      success: true,
      data: transactions,
      meta: {
        page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserBalance(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
    });

    let balance = 0;
    transactions.forEach(tx => {
      if (tx.type === 'CREDIT' || tx.type === 'REFUND') {
        balance += tx.amount;
      } else if (tx.type === 'DEBIT') {
        balance -= tx.amount;
      }
    });

    return {
      success: true,
      data: {
        userId,
        balance,
        totalTransactions: transactions.length,
      },
    };
  }
}
