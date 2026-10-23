"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const Minio = __importStar(require("minio"));
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.bucketName = 'visa-documents';
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: false,
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
        this.initBucket();
    }
    async initBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            }
        }
        catch (error) {
            console.error('Failed to initialize MinIO bucket:', error);
        }
    }
    async uploadDocument(caseId, file, fileName, mimeType, userId) {
        const visaCase = await this.prisma.visaCase.findFirst({
            where: { id: caseId, userId },
        });
        if (!visaCase) {
            throw new common_1.BadRequestException('Visa case not found or access denied');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(mimeType)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.length > maxSize) {
            throw new common_1.BadRequestException('File size exceeds 10MB limit.');
        }
        const ext = path.extname(fileName);
        const uniqueName = `${caseId}/${(0, uuid_1.v4)()}${ext}`;
        await this.minioClient.putObject(this.bucketName, uniqueName, file, file.length, {
            'Content-Type': mimeType,
        });
        const document = await this.prisma.visaCaseDocument.create({
            data: {
                caseId,
                fileName,
                fileUrl: uniqueName,
                fileSize: file.length,
                mimeType,
            },
        });
        await this.prisma.visaCaseTimeline.create({
            data: {
                caseId,
                action: 'DOCUMENT_UPLOADED',
                description: `Document "${fileName}" uploaded`,
            },
        });
        return {
            success: true,
            data: document,
        };
    }
    async getSignedUrl(caseId, documentId, userId) {
        const document = await this.prisma.visaCaseDocument.findFirst({
            where: {
                id: documentId,
                case: {
                    id: caseId,
                    userId,
                },
            },
        });
        if (!document) {
            throw new common_1.BadRequestException('Document not found or access denied');
        }
        const url = await this.minioClient.presignedGetObject(this.bucketName, document.fileUrl, 60 * 60);
        return {
            success: true,
            data: {
                url,
                expiresIn: 3600,
            },
        };
    }
    async deleteDocument(caseId, documentId, userId) {
        const document = await this.prisma.visaCaseDocument.findFirst({
            where: {
                id: documentId,
                case: {
                    id: caseId,
                    userId,
                },
            },
        });
        if (!document) {
            throw new common_1.BadRequestException('Document not found or access denied');
        }
        await this.minioClient.removeObject(this.bucketName, document.fileUrl);
        await this.prisma.visaCaseDocument.delete({
            where: { id: documentId },
        });
        await this.prisma.visaCaseTimeline.create({
            data: {
                caseId,
                action: 'DOCUMENT_DELETED',
                description: `Document "${document.fileName}" deleted`,
            },
        });
        return {
            success: true,
            data: { message: 'Document deleted successfully' },
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map