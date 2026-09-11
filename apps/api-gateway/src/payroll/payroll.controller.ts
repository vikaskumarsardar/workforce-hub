import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PAYROLL_SERVICE,
  JwtAuthGuard,
  TenantGuard,
  PermissionGuard,
  Permission,
  PATTERNS,
  ROUTES,
  RequestWithTenant,
  ExecutePayrollDto,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller(ROUTES.PAYROLL.ROOT)
export class PayrollController {
  private readonly logger = new Logger(PayrollController.name);

  constructor(
    @Inject(PAYROLL_SERVICE) private readonly payrollClient: ClientProxy,
  ) {}

  @Post(ROUTES.PAYROLL.EXECUTE)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('payroll:execute')
  async executePayroll(
    @Req() req: RequestWithTenant & { user: any },
    @Body() dto: ExecutePayrollDto,
  ) {
    this.logger.log(`Forwarding execute payroll request for period: ${dto.period}`);
    return firstValueFrom(
      this.payrollClient.send(PATTERNS.PAYROLL.EXECUTE_RUN, {
        tenantId: req.tenantId,
        actorId: req.user?.sub,
        dto,
      }),
    );
  }

  @Get(ROUTES.PAYROLL.MY_SLIPS)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMyPaySlips(@Req() req: RequestWithTenant & { user: any }) {
    this.logger.log(`Forwarding get my pay slips for employee: ${req.user?.sub}`);
    return firstValueFrom(
      this.payrollClient.send(PATTERNS.PAYROLL.GET_MY_SLIPS, {
        tenantId: req.tenantId,
        employeeId: req.user?.sub,
      }),
    );
  }

  @Get(ROUTES.PAYROLL.SLIP_BY_ID)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getPaySlipById(
    @Req() req: RequestWithTenant & { user: any },
    @Param('id') id: string,
  ) {
    this.logger.log(`Forwarding get pay slip by ID: ${id}`);
    const isHrOrAdmin = req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('HR');

    return firstValueFrom(
      this.payrollClient.send(PATTERNS.PAYROLL.GET_SLIP_BY_ID, {
        tenantId: req.tenantId,
        paySlipId: id,
        requesterId: req.user?.sub,
        isHrOrAdmin: Boolean(isHrOrAdmin),
      }),
    );
  }

  @Get(ROUTES.PAYROLL.RUN_BY_ID)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('payroll:read')
  async getPayrollRunById(
    @Req() req: RequestWithTenant,
    @Param('id') id: string,
  ) {
    this.logger.log(`Forwarding get payroll run by ID: ${id}`);
    return firstValueFrom(
      this.payrollClient.send(PATTERNS.PAYROLL.GET_PAYROLL_RUN, {
        tenantId: req.tenantId,
        payrollRunId: id,
      }),
    );
  }
}
