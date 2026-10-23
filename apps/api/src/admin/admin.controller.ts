import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { ReportsService } from '../reports/services/reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(parseInt(page), parseInt(limit), search);
  }

  @Get('orders')
  getOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllOrders(parseInt(page), parseInt(limit), status);
  }

  @Get('leads')
  getLeads(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllLeads(parseInt(page), parseInt(limit), status);
  }

  @Get('visa-cases')
  getVisaCases(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllVisaCases(parseInt(page), parseInt(limit), status);
  }

  @Get('logs')
  getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.adminService.getAdminActivityLogs(parseInt(page), parseInt(limit));
  }

  @Get('reports/revenue')
  getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getRevenueReport(new Date(startDate), new Date(endDate));
  }

  @Get('reports/orders-by-status')
  getOrdersByStatus() {
    return this.reportsService.getOrdersByStatusReport();
  }

  @Get('reports/visa')
  getVisaReport() {
    return this.reportsService.getVisaReport();
  }

  @Get('reports/top-destinations')
  getTopDestinations(@Query('limit') limit: string = '10') {
    return this.reportsService.getTopDestinations(parseInt(limit));
  }

  @Post('audit')
  async logActivity(
    @CurrentUser() user: any,
    @Body() body: { action: string; entityType?: string; entityId?: string; metadata?: any },
    @Req() req: any,
  ) {
    await this.adminService.logAdminActivity(
      user.userId,
      body.action,
      body.entityType,
      body.entityId,
      body.metadata,
      req.ip,
      req.headers['user-agent'],
    );

    return { success: true, data: { message: 'Activity logged' } };
  }
}
