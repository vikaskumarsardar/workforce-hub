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
  AUTH_SERVICE,
  JwtAuthGuard,
  OnboardEmployeeDto,
  PATTERNS,
  Permission,
  PermissionGuard,
  ROUTES,
  TenantGuard,
  RequestWithTenant,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller(ROUTES.EMPLOYEES.ROOT)
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('employees:create')
  async onboardEmployee(
    @Req() req: RequestWithTenant,
    @Body() dto: OnboardEmployeeDto,
  ) {
    this.logger.log(`Onboarding employee ${dto.email} for tenant ${req.tenantId}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.ONBOARD_EMPLOYEE, {
        tenantId: req.tenantId,
        dto,
      }),
    );
  }

  @Get(ROUTES.EMPLOYEES.ME)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMyProfile(@Req() req: RequestWithTenant & { user: any }) {
    this.logger.log(`Retrieving profile for employee ${req.user?.sub}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.GET_PROFILE, {
        tenantId: req.tenantId,
        employeeId: req.user?.sub,
      }),
    );
  }

  @Get(ROUTES.EMPLOYEES.BY_ID)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('employees:read')
  async getEmployeeById(
    @Req() req: RequestWithTenant,
    @Param('id') id: string,
  ) {
    this.logger.log(`Retrieving employee ID ${id} for tenant ${req.tenantId}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.GET_EMPLOYEE_BY_ID, {
        tenantId: req.tenantId,
        employeeId: id,
      }),
    );
  }
}
