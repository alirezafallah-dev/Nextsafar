import { AdminService } from './services/admin.service';
import { ReportsService } from '../reports/services/reports.service';
export declare class AdminController {
    private readonly adminService;
    private readonly reportsService;
    constructor(adminService: AdminService, reportsService: ReportsService);
    getDashboard(): Promise<{
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
    getUsers(page?: string, limit?: string, search?: string): Promise<{
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
    getOrders(page?: string, limit?: string, status?: string): Promise<{
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
    getLeads(page?: string, limit?: string, status?: string): Promise<{
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
    getVisaCases(page?: string, limit?: string, status?: string): Promise<{
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
    getLogs(page?: string, limit?: string): Promise<{
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
    getRevenueReport(startDate: string, endDate: string): Promise<{
        success: boolean;
        data: {
            period: {
                start: Date;
                end: Date;
            };
            totalRevenue: number;
            totalOrders: number;
            averageOrderValue: number;
            revenueByDay: Record<string, number>;
        };
    }>;
    getOrdersByStatus(): Promise<{
        success: boolean;
        data: {
            status: string;
            count: number;
        }[];
    }>;
    getVisaReport(): Promise<{
        success: boolean;
        data: {
            status: string;
            count: number;
        }[];
    }>;
    getTopDestinations(limit?: string): Promise<{
        success: boolean;
        data: {
            name: string;
            tourCount: number;
            leadsCount: number;
        }[];
    }>;
    logActivity(user: any, body: {
        action: string;
        entityType?: string;
        entityId?: string;
        metadata?: any;
    }, req: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
