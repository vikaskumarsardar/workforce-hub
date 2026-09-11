import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LeaveServiceService } from '@leave/leave-service.service';
import { PATTERNS } from '@app/common';

@Controller()
export class LeaveServiceController {
  private readonly logger = new Logger(LeaveServiceController.name);

  constructor(private readonly leaveService: LeaveServiceService) {}

  @MessagePattern(PATTERNS.LEAVE.SUBMIT)
  async handleSubmitLeave(
    @Payload() payload: { tenantId: string; employeeId: string; dto: any },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.SUBMIT}' for employee: ${payload?.employeeId}`);
    return this.leaveService.submitLeaveRequest(payload.tenantId, payload.employeeId, payload.dto);
  }

  @MessagePattern(PATTERNS.LEAVE.APPROVE)
  async handleApproveLeave(
    @Payload() payload: { tenantId: string; approverId: string; leaveRequestId: string; dto: any },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.APPROVE}' for leaveRequestId: ${payload?.leaveRequestId}`);
    return this.leaveService.approveLeaveRequest(payload.tenantId, payload.approverId, payload.leaveRequestId, payload.dto);
  }

  @MessagePattern(PATTERNS.LEAVE.REJECT)
  async handleRejectLeave(
    @Payload() payload: { tenantId: string; rejectorId: string; leaveRequestId: string; dto: any },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.REJECT}' for leaveRequestId: ${payload?.leaveRequestId}`);
    return this.leaveService.rejectLeaveRequest(payload.tenantId, payload.rejectorId, payload.leaveRequestId, payload.dto);
  }

  @MessagePattern(PATTERNS.LEAVE.VERIFY)
  async handleVerifyLeave(
    @Payload() payload: { tenantId: string; hrId: string; leaveRequestId: string; dto: any },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.VERIFY}' for leaveRequestId: ${payload?.leaveRequestId}`);
    return this.leaveService.verifyLeaveRequest(payload.tenantId, payload.hrId, payload.leaveRequestId, payload.dto);
  }

  @MessagePattern(PATTERNS.LEAVE.GET_MY_LEAVES)
  async handleGetMyLeaves(
    @Payload() payload: { tenantId: string; employeeId: string },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.GET_MY_LEAVES}' for employee: ${payload?.employeeId}`);
    return this.leaveService.getEmployeeLeaves(payload.tenantId, payload.employeeId);
  }

  @MessagePattern(PATTERNS.LEAVE.GET_BALANCES)
  async handleGetLeaveBalances(
    @Payload() payload: { tenantId: string; employeeId: string },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.GET_BALANCES}' for employee: ${payload?.employeeId}`);
    return this.leaveService.getEmployeeLeaveBalances(payload.tenantId, payload.employeeId);
  }

  @MessagePattern(PATTERNS.LEAVE.GET_LEAVE_BY_ID)
  async handleGetLeaveById(
    @Payload() payload: { tenantId: string; leaveRequestId: string },
  ) {
    this.logger.log(`Received RPC '${PATTERNS.LEAVE.GET_LEAVE_BY_ID}' for ID: ${payload?.leaveRequestId}`);
    return this.leaveService.getLeaveById(payload.tenantId, payload.leaveRequestId);
  }
}
