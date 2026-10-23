import { PrismaService } from '../../prisma/prisma.service';
export declare class LedgerService {
    private prisma;
    constructor(prisma: PrismaService);
    recordTransaction(params: {
        type: 'DEBIT' | 'CREDIT' | 'REFUND' | 'ADJUSTMENT';
        amount: number;
        userId: string;
        orderId?: string;
        paymentId?: string;
        reason: string;
        reference?: string;
    }): Promise<{
        success: boolean;
        data: {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            currency: string;
            createdAt: Date;
            userId: string;
            orderId: string | null;
            reason: string;
            amount: number;
            reference: string | null;
            reconciliationStatus: import("@prisma/client").$Enums.ReconciliationStatus;
            paymentId: string | null;
        };
    }>;
    getUserTransactions(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: ({
            order: {
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                source: string | null;
                status: import("@prisma/client").$Enums.OrderStatus;
                notes: string | null;
                idempotencyKey: string | null;
                orderNumber: string;
                totalAmount: number;
                discountAmount: number;
                finalAmount: number;
            };
            payment: {
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: import("@prisma/client").$Enums.PaymentStatus;
                idempotencyKey: string | null;
                orderId: string;
                amount: number;
                gatewayName: string | null;
                gatewayRefId: string | null;
                gatewayTrackId: string | null;
                gatewayMessage: string | null;
                paidAt: Date | null;
            };
        } & {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            currency: string;
            createdAt: Date;
            userId: string;
            orderId: string | null;
            reason: string;
            amount: number;
            reference: string | null;
            reconciliationStatus: import("@prisma/client").$Enums.ReconciliationStatus;
            paymentId: string | null;
        })[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getUserBalance(userId: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            balance: number;
            totalTransactions: number;
        };
    }>;
}
