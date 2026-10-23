import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisaCaseDto, UpdateVisaCaseStatusDto, CreateAppointmentDto } from '../dto/visa.dto';
export declare class VisaService {
    private prisma;
    constructor(prisma: PrismaService);
    getCountries(): Promise<{
        success: boolean;
        data: ({
            checklists: {
                order: number;
                id: string;
                name: string;
                description: string | null;
                countryId: string | null;
                visaTypeId: string | null;
                isRequired: boolean;
            }[];
        } & {
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
        })[];
    }>;
    getVisaTypes(): Promise<{
        success: boolean;
        data: ({
            visaChecklists: {
                order: number;
                id: string;
                name: string;
                description: string | null;
                countryId: string | null;
                visaTypeId: string | null;
                isRequired: boolean;
            }[];
        } & {
            visaType: string | null;
            id: string;
            isActive: boolean;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            wpPostId: number | null;
            slug: string;
            syncStatus: string;
            shortDescription: string | null;
            fullContent: string | null;
            featuredImage: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            focusKeyword: string | null;
            contentVersion: number;
            lastSyncedAt: Date | null;
            gallery: import("@prisma/client/runtime/library").JsonValue | null;
            prices: import("@prisma/client/runtime/library").JsonValue | null;
            basePrice: number | null;
            processingDays: number | null;
            validityDays: number | null;
            issueTime: string | null;
            expiryTime: string | null;
            entryType: string | null;
            requiredDocuments: import("@prisma/client/runtime/library").JsonValue | null;
            bannerImage: string | null;
        })[];
    }>;
    createCase(userId: string, dto: CreateVisaCaseDto): Promise<{
        success: boolean;
        data: {
            visaType: {
                visaType: string | null;
                id: string;
                isActive: boolean;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                wpPostId: number | null;
                slug: string;
                syncStatus: string;
                shortDescription: string | null;
                fullContent: string | null;
                featuredImage: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
                focusKeyword: string | null;
                contentVersion: number;
                lastSyncedAt: Date | null;
                gallery: import("@prisma/client/runtime/library").JsonValue | null;
                prices: import("@prisma/client/runtime/library").JsonValue | null;
                basePrice: number | null;
                processingDays: number | null;
                validityDays: number | null;
                issueTime: string | null;
                expiryTime: string | null;
                entryType: string | null;
                requiredDocuments: import("@prisma/client/runtime/library").JsonValue | null;
                bannerImage: string | null;
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
        };
    }>;
    getUserCases(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: ({
            visaType: {
                visaType: string | null;
                id: string;
                isActive: boolean;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                wpPostId: number | null;
                slug: string;
                syncStatus: string;
                shortDescription: string | null;
                fullContent: string | null;
                featuredImage: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
                focusKeyword: string | null;
                contentVersion: number;
                lastSyncedAt: Date | null;
                gallery: import("@prisma/client/runtime/library").JsonValue | null;
                prices: import("@prisma/client/runtime/library").JsonValue | null;
                basePrice: number | null;
                processingDays: number | null;
                validityDays: number | null;
                issueTime: string | null;
                expiryTime: string | null;
                entryType: string | null;
                requiredDocuments: import("@prisma/client/runtime/library").JsonValue | null;
                bannerImage: string | null;
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
            documents: {
                id: string;
                notes: string | null;
                caseId: string;
                uploadedAt: Date;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                mimeType: string;
                isVerified: boolean;
                verifiedBy: string | null;
                verifiedAt: Date | null;
            }[];
            appointments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                notes: string | null;
                appointmentDate: Date;
                location: string | null;
                referenceNumber: string | null;
                caseId: string;
            }[];
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
    getCaseById(userId: string, caseId: string): Promise<{
        success: boolean;
        data: {
            visaType: {
                visaChecklists: {
                    order: number;
                    id: string;
                    name: string;
                    description: string | null;
                    countryId: string | null;
                    visaTypeId: string | null;
                    isRequired: boolean;
                }[];
            } & {
                visaType: string | null;
                id: string;
                isActive: boolean;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                wpPostId: number | null;
                slug: string;
                syncStatus: string;
                shortDescription: string | null;
                fullContent: string | null;
                featuredImage: string | null;
                seoTitle: string | null;
                seoDescription: string | null;
                focusKeyword: string | null;
                contentVersion: number;
                lastSyncedAt: Date | null;
                gallery: import("@prisma/client/runtime/library").JsonValue | null;
                prices: import("@prisma/client/runtime/library").JsonValue | null;
                basePrice: number | null;
                processingDays: number | null;
                validityDays: number | null;
                issueTime: string | null;
                expiryTime: string | null;
                entryType: string | null;
                requiredDocuments: import("@prisma/client/runtime/library").JsonValue | null;
                bannerImage: string | null;
            };
            country: {
                checklists: {
                    order: number;
                    id: string;
                    name: string;
                    description: string | null;
                    countryId: string | null;
                    visaTypeId: string | null;
                    isRequired: boolean;
                }[];
            } & {
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
            documents: {
                id: string;
                notes: string | null;
                caseId: string;
                uploadedAt: Date;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                mimeType: string;
                isVerified: boolean;
                verifiedBy: string | null;
                verifiedAt: Date | null;
            }[];
            appointments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                notes: string | null;
                appointmentDate: Date;
                location: string | null;
                referenceNumber: string | null;
                caseId: string;
            }[];
            timeline: {
                id: string;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                description: string | null;
                oldStatus: string | null;
                newStatus: string | null;
                changedBy: string | null;
                action: string;
                caseId: string;
            }[];
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
        };
    }>;
    updateCaseStatus(caseId: string, dto: UpdateVisaCaseStatusDto, changedBy: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createAppointment(caseId: string, dto: CreateAppointmentDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            appointmentDate: Date;
            location: string | null;
            referenceNumber: string | null;
            caseId: string;
        };
    }>;
}
