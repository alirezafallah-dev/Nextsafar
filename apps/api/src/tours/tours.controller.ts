import { Controller, Get, Param, Query, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ToursService } from './tours.service';
import { TourQueryDto, tourQuerySchema } from './dto/tour-query.dto';
import { TourLeadDto, tourLeadSchema } from './dto/tour-lead.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(tourQuerySchema)) query: TourQueryDto) {
    return this.toursService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.toursService.findOneBySlug(slug);
  }

  @Post(':id/lead')
  @HttpCode(HttpStatus.CREATED)
  createLead(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(tourLeadSchema)) dto: TourLeadDto,
    @Req() req: any,
  ) {
    const source = req.headers['user-agent'] || 'Web';
    return this.toursService.createLead(id, dto, source);
  }
}
