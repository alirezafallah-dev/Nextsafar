import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { TourQueryDto } from './dto/tour-query.dto';
import { TourLeadDto } from './dto/tour-lead.dto';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  findAll(@Query() query: TourQueryDto) {
    return this.toursService.findAll(query);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.toursService.findOneBySlug(slug);
  }

  @Post(':id/lead')
  createLead(@Param('id') id: string, @Body() dto: TourLeadDto) {
    // اضافه کردن source به عنوان آرگومان سوم
    return this.toursService.createLead(id, dto, 'PUBLIC_FORM');
  }
}
