import { PrismaService } from '../../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    private minioClient;
    private bucketName;
    constructor(prisma: PrismaService);
    private initBucket;
    uploadDocument(caseId: string, file: Buffer, fileName: string, mimeType: string, userId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getSignedUrl(caseId: string, documentId: string, userId: string): Promise<{
        success: boolean;
        data: {
            url: string;
            expiresIn: number;
        };
    }>;
    deleteDocument(caseId: string, documentId: string, userId: string): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
