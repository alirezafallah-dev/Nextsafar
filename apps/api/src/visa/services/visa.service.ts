import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisaCaseDto, UpdateVisaCaseStatusDto, CreateAppointmentDto } from '../dto/visa.dto';

@Injectable()
export class VisaService {
  constructor(private prisma: PrismaService) {}

  async getCountries() {
    const countries = await this.prisma.visaCountry.findMany({
      where: { isActive: true },
      include: {
        checklists: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: countries,
    };
  }

  async getVisaTypes() {
    const visaTypes = await this.prisma.visaType.findMany({
      where: { isActive: true },
      include: {
        visaChecklists: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    return {
      success: true,
      data: visaTypes,
    };
  }

  async createCase(userId: string, dto: CreateVisaCaseDto) {
    // Find country if countryId provided
    let country = null;
    if (dto.countryId) {
      country = await this.prisma.visaCountry.findUnique({
        where: { id: dto.countryId },
      });
      if (!country) {
        throw new BadRequestException('Country not found');
      }
    }

    // Find VisaType if visaTypeId provided (new system)
    let visaType = null;
    if (dto.visaTypeId) {
      visaType = await this.prisma.visaType.findUnique({
        where: { id: dto.visaTypeId },
      });
      if (!visaType) {
        throw new BadRequestException('Visa type not found');
      }
    }

    const caseNumber = `VISA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const visaCase = await this.prisma.$transaction(async (tx) => {
      const newCase = await tx.visaCase.create({
        data: {
          userId,
          countryId: dto.countryId || null,
          visaTypeId: dto.visaTypeId || null,
          caseNumber,
          status: 'INITIAL',
          applicantName: dto.applicantName,
          applicantPassport: dto.applicantPassport,
          travelDate: dto.travelDate ? new Date(dto.travelDate) : null,
          visaCategory: dto.visaType, // renamed field (text value like TOURIST)
          notes: dto.notes,
          timeline: {
            create: {
              action: 'CASE_CREATED',
              newStatus: 'INITIAL',
              description: `Visa case created${country ? ` for ${country.name}` : ''}${visaType ? ` - ${visaType.title}` : ''}`,
            },
          },
        },
        include: {
          country: true,
          visaType: true,
        },
      });

      return newCase;
    });

    return {
      success: true,
      data: visaCase,
    };
  }

  async getUserCases(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [cases, total] = await this.prisma.$transaction([
      this.prisma.visaCase.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          country: true,
          visaType: true,
          documents: {
            take: 3,
            orderBy: { uploadedAt: 'desc' },
          },
          appointments: {
            take: 1,
            orderBy: { appointmentDate: 'desc' },
          },
        },
      }),
      this.prisma.visaCase.count({ where: { userId } }),
    ]);

    return {
      success: true,
      data: cases,
      meta: {
        page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getCaseById(userId: string, caseId: string) {
    const visaCase = await this.prisma.visaCase.findFirst({
      where: { id: caseId, userId },
      include: {
        country: {
          include: {
            checklists: true,
          },
        },
        visaType: {
          include: {
            visaChecklists: true,
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!visaCase) {
      throw new NotFoundException('Visa case not found');
    }

    return {
      success: true,
      data: visaCase,
    };
  }

  async updateCaseStatus(caseId: string, dto: UpdateVisaCaseStatusDto, changedBy: string) {
    const visaCase = await this.prisma.visaCase.findUnique({ where: { id: caseId } });
    if (!visaCase) {
      throw new NotFoundException('Visa case not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedCase = await tx.visaCase.update({
        where: { id: caseId },
        data: {
          status: dto.status,
          notes: dto.notes ? `${visaCase.notes || ''}\n${dto.notes}` : visaCase.notes,
        },
      });

      await tx.visaCaseTimeline.create({
        data: {
          caseId,
          action: 'STATUS_CHANGED',
          oldStatus: visaCase.status,
          newStatus: dto.status,
          description: dto.notes || `Status changed to ${dto.status}`,
          changedBy,
        },
      });

      return updatedCase;
    });

    return {
      success: true,
      data: updated,
    };
  }

  async createAppointment(caseId: string, dto: CreateAppointmentDto) {
    const visaCase = await this.prisma.visaCase.findUnique({ where: { id: caseId } });
    if (!visaCase) {
      throw new NotFoundException('Visa case not found');
    }

    const appointment = await this.prisma.$transaction(async (tx) => {
      const newAppointment = await tx.visaAppointment.create({
        data: {
          caseId,
          appointmentDate: new Date(dto.appointmentDate),
          location: dto.location,
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
          status: 'SCHEDULED',
        },
      });

      await tx.visaCaseTimeline.create({
        data: {
          caseId,
          action: 'APPOINTMENT_SCHEDULED',
          description: `Appointment scheduled for ${dto.appointmentDate}`,
        },
      });

      if (visaCase.status === 'APPOINTMENT_NEEDED') {
        await tx.visaCase.update({
          where: { id: caseId },
          data: { status: 'APPOINTMENT_DONE' },
        });
      }

      return newAppointment;
    });

    return {
      success: true,
      data: appointment,
    };
  }
}
