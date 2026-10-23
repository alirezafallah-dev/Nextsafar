import { PrismaService } from '../../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getRevenueReport(startDate: Date, endDate: Date): Promise<{
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
    getOrdersByStatusReport(): Promise<{
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
    getTopDestinations(limit?: number): Promise<{
        success: boolean;
        data: {
            name: string;
            tourCount: number;
            leadsCount: number;
        }[];
    }>;
}
