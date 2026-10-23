import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../../ledger/services/ledger.service';
export declare class PaymentsService {
    private prisma;
    private ledger;
    constructor(prisma: PrismaService, ledger: LedgerService);
    initiatePayment(orderId: string, userId: string, amount: number): Promise<{
        success: boolean;
        data: {
            paymentId: string;
            gatewayUrl: string;
            amount: number;
        };
    }>;
    verifyPayment(paymentId: string, gatewayRefId: string, success: boolean): Promise<{
        success: boolean;
        data: {
            paymentId: string;
            status: string;
            message: string;
        };
    }>;
    getPaymentStatus(paymentId: string): Promise<{
        success: boolean;
        data: {
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
        } & {
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
    }>;
}
