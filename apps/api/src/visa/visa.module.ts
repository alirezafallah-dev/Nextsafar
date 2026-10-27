import { Module } from '@nestjs/common';
import { VisaController } from './visa.controller';
import { VisaService } from './services/visa.service';
import { DocumentsService } from '../documents/services/documents.service';

@Module({
  controllers: [VisaController],
  providers: [VisaService, DocumentsService],
  exports: [VisaService],
})
export class VisaModule {}
