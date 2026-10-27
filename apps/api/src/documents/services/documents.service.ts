import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private minioClient: Minio.Client;
  private bucketName = 'visa-documents';

  constructor(private prisma: PrismaService) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.initBucket();
  }

  private async initBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.error('Failed to initialize MinIO bucket:', error);
    }
  }

  async uploadDocument(
    caseId: string,
    file: Buffer,
    fileName: string,
    mimeType: string,
    userId: string,
  ) {
    const visaCase = await this.prisma.visaCase.findFirst({
      where: { id: caseId, userId },
    });

    if (!visaCase) {
      throw new BadRequestException('Visa case not found or access denied');
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.length > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }

    // Generate unique filename
    const ext = path.extname(fileName);
    const uniqueName = `${caseId}/${uuidv4()}${ext}`;

    // Upload to MinIO
    await this.minioClient.putObject(this.bucketName, uniqueName, file, file.length, {
      'Content-Type': mimeType,
    });

    // Save to database
    const document = await this.prisma.visaCaseDocument.create({
      data: {
        caseId,
        fileName,
        fileUrl: uniqueName,
        fileSize: file.length,
        mimeType,
      },
    });

    // Add timeline entry
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

  async getSignedUrl(caseId: string, documentId: string, userId: string) {
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
      throw new BadRequestException('Document not found or access denied');
    }

    // Generate signed URL (valid for 1 hour)
    const url = await this.minioClient.presignedGetObject(
      this.bucketName,
      document.fileUrl,
      60 * 60, // 1 hour
    );

    return {
      success: true,
      data: {
        url,
        expiresIn: 3600,
      },
    };
  }

  async deleteDocument(caseId: string, documentId: string, userId: string) {
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
      throw new BadRequestException('Document not found or access denied');
    }

    // Delete from MinIO
    await this.minioClient.removeObject(this.bucketName, document.fileUrl);

    // Delete from database
    await this.prisma.visaCaseDocument.delete({
      where: { id: documentId },
    });

    // Add timeline entry
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
}
