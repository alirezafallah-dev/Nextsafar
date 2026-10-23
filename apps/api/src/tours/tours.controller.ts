import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  async findAll() {
    return this.toursService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.toursService.findBySlug(slug);
  }

  @Post(':id/lead')
  async createLead(@Param('id') id: string, @Body() leadDto: any) {
    return this.toursService.createLead(id, leadDto);
  }
}
