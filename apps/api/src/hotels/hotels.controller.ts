import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelQueryDto, hotelQuerySchema } from './dto/hotel-query.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(hotelQuerySchema)) query: HotelQueryDto) {
    return this.hotelsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.hotelsService.findOneBySlug(slug);
  }
}
