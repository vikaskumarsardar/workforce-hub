import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PayrollServiceService } from '@payroll/payroll-service.service';
import { PATTERNS } from '@app/common';

@Controller()
export class PayrollServiceController {
  private readonly logger = new Logger(PayrollServiceController.name);

  constructor(private readonly payrollService: PayrollServiceService) {}

  @MessagePattern(PATTERNS.PAYROLL.EXECUTE_RUN)
  async handleExecutePayrollRun(
    @Payload() payload: { tenantId: string; actorId: string; dto: any },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.PAYROLL.EXECUTE_RUN}' for period: ${payload?.dto?.period}`);
    return this.payrollService.executePayrollRun(payload.tenantId, payload.actorId, payload.dto);
  }

  @MessagePattern(PATTERNS.PAYROLL.GET_MY_SLIPS)
  async handleGetMySlips(
    @Payload() payload: { tenantId: string; employeeId: string },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.PAYROLL.GET_MY_SLIPS}' for employee: ${payload?.employeeId}`);
    return this.payrollService.getEmployeePaySlips(payload.tenantId, payload.employeeId);
  }

  @MessagePattern(PATTERNS.PAYROLL.GET_SLIP_BY_ID)
  async handleGetSlipById(
    @Payload() payload: { tenantId: string; paySlipId: string; requesterId: string; isHrOrAdmin: boolean },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.PAYROLL.GET_SLIP_BY_ID}' for paySlipId: ${payload?.paySlipId}`);
    return this.payrollService.getPaySlipById(
      payload.tenantId,
      payload.paySlipId,
      payload.requesterId,
      payload.isHrOrAdmin,
    );
  }

  @MessagePattern(PATTERNS.PAYROLL.GET_PAYROLL_RUN)
  async handleGetPayrollRun(
    @Payload() payload: { tenantId: string; payrollRunId: string },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.PAYROLL.GET_PAYROLL_RUN}' for payrollRunId: ${payload?.payrollRunId}`);
    return this.payrollService.getPayrollRunById(payload.tenantId, payload.payrollRunId);
  }
}
