import { PaymentsService } from './services/payments.service';
import { LedgerService } from '../ledger/services/ledger.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly ledgerService;
    constructor(paymentsService: PaymentsService, ledgerService: LedgerService);
    startPayment(user: any, orderId: string, body: {
        amount: number;
    }): Promise<{
        success: boolean;
        data: {
            paymentId: string;
            gatewayUrl: string;
            amount: number;
        };
    }>;
    paymentCallback(body: {
        paymentId: string;
        refId: string;
        success: boolean;
    }): Promise<{
        success: boolean;
        data: {
            paymentId: string;
            status: string;
            message: string;
        };
    }>;
    getPaymentStatus(orderId: string): Promise<{
        success: boolean;
        data: {
            orderId: string;
        };
    }>;
    getUserTransactions(user: any, page?: string, limit?: string): Promise<{
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
    getUserBalance(user: any): Promise<{
        success: boolean;
        data: {
            userId: string;
            balance: number;
            totalTransactions: number;
        };
    }>;
}
