import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { VisaService } from './services/visa.service';
import { DocumentsService } from '../documents/services/documents.service';
import { CreateVisaCaseDto, createVisaCaseSchema, UpdateVisaCaseStatusDto, updateVisaCaseStatusSchema, CreateAppointmentDto, createAppointmentSchema } from './dto/visa.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('visa')
@UseGuards(JwtAuthGuard)
export class VisaController {
  constructor(
    private readonly visaService: VisaService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get('countries')
  getCountries() {
    return this.visaService.getCountries();
  }

  @Get('types')
  getVisaTypes() {
    return this.visaService.getVisaTypes();
  }

  @Post('cases')
  createCase(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createVisaCaseSchema)) dto: CreateVisaCaseDto,
  ) {
    return this.visaService.createCase(user.userId, dto);
  }

  @Get('cases')
  getUserCases(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.visaService.getUserCases(user.userId, parseInt(page), parseInt(limit));
  }

  @Get('cases/:id')
  getCaseById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.visaService.getCaseById(user.userId, id);
  }

  @Post('cases/:id/appointments')
  createAppointment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createAppointmentSchema)) dto: CreateAppointmentDto,
  ) {
    return this.visaService.createAppointment(id, dto);
  }

  @Get('cases/:id/documents/:docId/url')
  async getDocumentUrl(
    @CurrentUser() user: any,
    @Param('id') caseId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.getSignedUrl(caseId, docId, user.userId);
  }
}
