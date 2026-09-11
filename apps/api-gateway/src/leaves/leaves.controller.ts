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
  LEAVE_SERVICE,
  JwtAuthGuard,
  TenantGuard,
  PermissionGuard,
  Permission,
  PATTERNS,
  ROUTES,
  RequestWithTenant,
  SubmitLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller(ROUTES.LEAVES.ROOT)
export class LeavesController {
  private readonly logger = new Logger(LeavesController.name);

  constructor(
    @Inject(LEAVE_SERVICE) private readonly leaveClient: ClientProxy,
  ) {}

  @Post(ROUTES.LEAVES.SUBMIT)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async submitLeave(
    @Req() req: RequestWithTenant & { user: any },
    @Body() dto: SubmitLeaveDto,
  ) {
    this.logger.log(`Forwarding submit leave request for employee: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.SUBMIT, {
        tenantId: req.tenantId,
        employeeId: req.user?.sub,
        dto,
      }),
    );
  }

  @Post(ROUTES.LEAVES.APPROVE)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('leaves:approve')
  async approveLeave(
    @Req() req: RequestWithTenant & { user: any },
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
  ) {
    this.logger.log(`Forwarding approve leave request ID ${id} by approver: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.APPROVE, {
        tenantId: req.tenantId,
        approverId: req.user?.sub,
        leaveRequestId: id,
        dto,
      }),
    );
  }

  @Post(ROUTES.LEAVES.REJECT)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('leaves:approve')
  async rejectLeave(
    @Req() req: RequestWithTenant & { user: any },
    @Param('id') id: string,
    @Body() dto: RejectLeaveDto,
  ) {
    this.logger.log(`Forwarding reject leave request ID ${id} by rejector: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.REJECT, {
        tenantId: req.tenantId,
        rejectorId: req.user?.sub,
        leaveRequestId: id,
        dto,
      }),
    );
  }

  @Post(ROUTES.LEAVES.VERIFY)
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
  @Permission('leaves:verify')
  async verifyLeave(
    @Req() req: RequestWithTenant & { user: any },
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
  ) {
    this.logger.log(`Forwarding HR verify leave request ID ${id} by HR: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.VERIFY, {
        tenantId: req.tenantId,
        hrId: req.user?.sub,
        leaveRequestId: id,
        dto,
      }),
    );
  }

  @Get(ROUTES.LEAVES.MY_LEAVES)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMyLeaves(@Req() req: RequestWithTenant & { user: any }) {
    this.logger.log(`Forwarding get my leaves for employee: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.GET_MY_LEAVES, {
        tenantId: req.tenantId,
        employeeId: req.user?.sub,
      }),
    );
  }

  @Get(ROUTES.LEAVES.BALANCES)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getLeaveBalances(@Req() req: RequestWithTenant & { user: any }) {
    this.logger.log(`Forwarding get leave balances for employee: ${req.user?.sub}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.GET_BALANCES, {
        tenantId: req.tenantId,
        employeeId: req.user?.sub,
      }),
    );
  }

  @Get(ROUTES.LEAVES.BY_ID)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getLeaveById(
    @Req() req: RequestWithTenant,
    @Param('id') id: string,
  ) {
    this.logger.log(`Forwarding get leave request by ID: ${id}`);
    return firstValueFrom(
      this.leaveClient.send(PATTERNS.LEAVE.GET_LEAVE_BY_ID, {
        tenantId: req.tenantId,
        leaveRequestId: id,
      }),
    );
  }
}
