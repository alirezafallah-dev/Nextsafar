import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
export declare class AdminService {
    private prisma;
    private queue;
    constructor(prisma: PrismaService, queue: QueueService);
    getDashboardStats(): Promise<{
        success: boolean;
        data: {
            overview: {
                totalUsers: number;
                totalOrders: number;
                totalRevenue: number;
                pendingOrders: number;
                activeVisaCases: number;
                totalHotels: number;
                totalTours: number;
            };
            recentOrders: ({
                user: {
                    mobile: string;
                    firstName: string | null;
                    lastName: string | null;
                    id: string;
                    email: string | null;
                    passwordHash: string;
                    isActive: boolean;
                    language: string;
                    currency: string;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
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
            recentLeads: {
                message: string | null;
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
                source: string | null;
                status: string;
                customerName: string | null;
                phone: string | null;
                passengerCount: number | null;
                preferredDate: Date | null;
                leadType: string;
                relatedHotelId: string | null;
                assignedAgentId: string | null;
                nextFollowupDate: Date | null;
                notes: import("@prisma/client/runtime/library").JsonValue | null;
                relatedTourId: string | null;
            }[];
            generatedAt: string;
        };
    }>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        success: boolean;
        data: ({
            roles: ({
                role: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    name: string;
                    displayName: string;
                };
            } & {
                userId: string;
                roleId: string;
            })[];
            _count: {
                orders: number;
                visaCases: number;
            };
        } & {
            mobile: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
            email: string | null;
            passwordHash: string;
            isActive: boolean;
            language: string;
            currency: string;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getAllOrders(page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: ({
            user: {
                mobile: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
                email: string | null;
                passwordHash: string;
                isActive: boolean;
                language: string;
                currency: string;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
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
    getAllLeads(page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            message: string | null;
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            source: string | null;
            status: string;
            customerName: string | null;
            phone: string | null;
            passengerCount: number | null;
            preferredDate: Date | null;
            leadType: string;
            relatedHotelId: string | null;
            assignedAgentId: string | null;
            nextFollowupDate: Date | null;
            notes: import("@prisma/client/runtime/library").JsonValue | null;
            relatedTourId: string | null;
        }[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    getAllVisaCases(page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: ({
            user: {
                mobile: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
                email: string | null;
                passwordHash: string;
                isActive: boolean;
                language: string;
                currency: string;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            _count: {
                documents: number;
                appointments: number;
            };
            country: {
                id: string;
                isActive: boolean;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                description: string | null;
                processingTime: string | null;
                fee: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import("@prisma/client").$Enums.VisaCaseStatus;
            assignedAgentId: string | null;
            notes: string | null;
            countryId: string | null;
            visaTypeId: string | null;
            applicantName: string;
            applicantPassport: string | null;
            travelDate: Date | null;
            caseNumber: string;
            visaCategory: string | null;
        })[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    logAdminActivity(adminId: string, action: string, entityType?: string, entityId?: string, metadata?: any, ip?: string, userAgent?: string): Promise<void>;
    getAdminActivityLogs(page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            action: string;
            adminId: string;
            entityType: string | null;
            entityId: string | null;
            ip: string | null;
            userAgent: string | null;
        }[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
}
