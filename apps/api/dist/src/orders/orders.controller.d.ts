import { OrdersService } from './services/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(user: any, dto: CreateOrderDto): Promise<{
        success: boolean;
        data: {
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
        meta: {
            message: string;
        };
    } | {
        success: boolean;
        data: {
            items: {
                id: string;
                itemType: string;
                itemId: string;
                itemName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            }[];
            passengers: {
                firstName: string;
                lastName: string;
                id: string;
                nationalId: string | null;
                passportNumber: string | null;
                birthDate: Date | null;
                gender: string | null;
                relationship: string | null;
                orderId: string;
            }[];
        } & {
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
        meta?: undefined;
    }>;
    getUserOrders(user: any, page?: string, limit?: string): Promise<{
        success: boolean;
        data: ({
            items: {
                id: string;
                itemType: string;
                itemId: string;
                itemName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            }[];
            passengers: {
                firstName: string;
                lastName: string;
                id: string;
                nationalId: string | null;
                passportNumber: string | null;
                birthDate: Date | null;
                gender: string | null;
                relationship: string | null;
                orderId: string;
            }[];
            payments: {
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
            }[];
        } & {
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
        })[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getOrderById(user: any, id: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: string;
                itemType: string;
                itemId: string;
                itemName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            }[];
            passengers: {
                firstName: string;
                lastName: string;
                id: string;
                nationalId: string | null;
                passportNumber: string | null;
                birthDate: Date | null;
                gender: string | null;
                relationship: string | null;
                orderId: string;
            }[];
            payments: {
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
            }[];
            statusHistory: {
                id: string;
                createdAt: Date;
                orderId: string;
                oldStatus: string | null;
                newStatus: string;
                changedBy: string | null;
                reason: string | null;
            }[];
        } & {
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
    }>;
}
