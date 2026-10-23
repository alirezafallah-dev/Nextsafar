import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { CreateOrderDto, createOrderSchema } from './dto/create-order.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.userId, dto);
  }

  @Get()
  getUserOrders(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.ordersService.getUserOrders(user.userId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  getOrderById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(user.userId, id);
  }
}
