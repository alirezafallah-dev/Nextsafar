import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { LedgerService } from '../ledger/services/ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Post('orders/:id/payment/start')
  @UseGuards(JwtAuthGuard)
  async startPayment(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
    @Body() body: { amount: number },
  ) {
    return this.paymentsService.initiatePayment(orderId, user.userId, body.amount);
  }

  @Post('payments/callback')
  async paymentCallback(@Body() body: { paymentId: string; refId: string; success: boolean }) {
    return this.paymentsService.verifyPayment(body.paymentId, body.refId, body.success);
  }

  @Get('orders/:id/payment/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('id') orderId: string) {
    // Get latest payment for order
    return { success: true, data: { orderId } };
  }

  @Get('users/transactions')
  @UseGuards(JwtAuthGuard)
  async getUserTransactions(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.ledgerService.getUserTransactions(user.userId, parseInt(page), parseInt(limit));
  }

  @Get('users/balance')
  @UseGuards(JwtAuthGuard)
  async getUserBalance(@CurrentUser() user: any) {
    return this.ledgerService.getUserBalance(user.userId);
  }
}
