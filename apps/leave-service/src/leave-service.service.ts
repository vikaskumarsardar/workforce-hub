import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  LeaveRequestEntity,
  LeaveBalanceEntity,
  LeaveTypeEntity,
  LeaveApprovalEntity,
  OutboxEventEntity,
  AuditLogEntity,
  EmployeeEntity,
  SubmitLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
} from '@app/common';

@Injectable()
export class LeaveServiceService {
  private readonly logger = new Logger(LeaveServiceService.name);

  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(LeaveBalanceEntity)
    private readonly leaveBalanceRepo: Repository<LeaveBalanceEntity>,
    @InjectRepository(LeaveTypeEntity)
    private readonly leaveTypeRepo: Repository<LeaveTypeEntity>,
    @InjectRepository(LeaveApprovalEntity)
    private readonly leaveApprovalRepo: Repository<LeaveApprovalEntity>,
    @InjectRepository(OutboxEventEntity)
    private readonly outboxEventRepo: Repository<OutboxEventEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Helper: Ensures default leave types exist for a tenant and returns them
   */
  private async ensureDefaultLeaveTypes(tenantId: string): Promise<LeaveTypeEntity[]> {
    let types = await this.leaveTypeRepo.find({ where: { tenantId } });
    if (types.length === 0) {
      const defaults = [
        { tenantId, name: 'ANNUAL', defaultDaysPerYear: 20, isPaid: true },
        { tenantId, name: 'SICK', defaultDaysPerYear: 10, isPaid: true },
        { tenantId, name: 'UNPAID', defaultDaysPerYear: 30, isPaid: false },
      ];
      types = await this.leaveTypeRepo.save(
        defaults.map((d) => this.leaveTypeRepo.create(d)),
      );
    }
    return types;
  }

  /**
   * Submits a new leave request with balance verification and atomic outbox logging
   */
  async submitLeaveRequest(tenantId: string, employeeId: string, dto: SubmitLeaveDto) {
    this.logger.log(`Submitting leave request for employee: ${employeeId}, type: ${dto.leaveTypeId}`);

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid date range. End date must be greater than or equal to start date.',
      });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentYear = start.getFullYear();

    // Check balance
    let balance = await this.leaveBalanceRepo.findOne({
      where: { employeeId, leaveTypeId: dto.leaveTypeId, year: currentYear },
    });

    if (!balance) {
      const leaveType = await this.leaveTypeRepo.findOne({ where: { id: dto.leaveTypeId } });
      const allocatedDays = leaveType ? leaveType.defaultDaysPerYear : 20;

      balance = this.leaveBalanceRepo.create({
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        year: currentYear,
        allocatedDays,
        usedDays: 0,
        pendingDays: 0,
      });
      balance = await this.leaveBalanceRepo.save(balance);
    }

    const availableDays = Number(balance.allocatedDays) - Number(balance.usedDays) - Number(balance.pendingDays);
    if (availableDays < totalDays) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Insufficient leave balance. Requested: ${totalDays} days, Available: ${availableDays} days.`,
      });
    }

    // Atomic DB Transaction
    return this.dataSource.transaction(async (manager) => {
      balance.pendingDays = Number(balance.pendingDays) + totalDays;
      await manager.save(balance);

      const leaveRequest = manager.create(LeaveRequestEntity, {
        tenantId,
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        totalDays,
        status: 'SUBMITTED',
        reason: dto.reason,
      });
      await manager.save(leaveRequest);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: 'leave.submitted',
        payload: {
          leaveRequestId: leaveRequest.id,
          tenantId,
          employeeId,
          leaveTypeId: dto.leaveTypeId,
          totalDays,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
        processed: false,
      });
      await manager.save(outboxEvent);

      const auditLog = manager.create(AuditLogEntity, {
        tenantId,
        actorId: employeeId,
        action: 'LEAVE_SUBMITTED',
        entityType: 'LeaveRequest',
        entityId: leaveRequest.id,
        newValue: { totalDays, status: 'SUBMITTED' },
      });
      await manager.save(auditLog);

      return {
        message: 'Leave request submitted successfully.',
        leaveRequestId: leaveRequest.id,
        status: leaveRequest.status,
        totalDays,
      };
    });
  }

  /**
   * Manager approves a SUBMITTED leave request
   */
  async approveLeaveRequest(tenantId: string, approverId: string, leaveRequestId: string, dto: ApproveLeaveDto) {
    this.logger.log(`Manager approval for leave request: ${leaveRequestId} by approver: ${approverId}`);

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId, tenantId },
    });

    if (!leaveRequest) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Leave request with ID ${leaveRequestId} not found.`,
      });
    }

    if (leaveRequest.status !== 'SUBMITTED') {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cannot approve leave request in '${leaveRequest.status}' status. Must be in 'SUBMITTED' status.`,
      });
    }

    return this.dataSource.transaction(async (manager) => {
      leaveRequest.status = 'MANAGER_APPROVED';
      await manager.save(leaveRequest);

      const approval = manager.create(LeaveApprovalEntity, {
        leaveRequestId,
        approverId,
        step: 'MANAGER',
        status: 'APPROVED',
        comments: dto.comments || 'Approved by Manager',
      });
      await manager.save(approval);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: 'leave.approved',
        payload: {
          leaveRequestId,
          tenantId,
          employeeId: leaveRequest.employeeId,
          step: 'MANAGER_APPROVED',
          approverId,
        },
        processed: false,
      });
      await manager.save(outboxEvent);

      return {
        message: 'Leave request approved by manager.',
        leaveRequestId,
        status: leaveRequest.status,
      };
    });
  }

  /**
   * Rejects a leave request and restores pending balance
   */
  async rejectLeaveRequest(tenantId: string, rejectorId: string, leaveRequestId: string, dto: RejectLeaveDto) {
    this.logger.log(`Rejecting leave request: ${leaveRequestId} by: ${rejectorId}`);

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId, tenantId },
    });

    if (!leaveRequest) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Leave request with ID ${leaveRequestId} not found.`,
      });
    }

    if (leaveRequest.status === 'REJECTED' || leaveRequest.status === 'PAYROLL_LOCKED') {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cannot reject leave request in '${leaveRequest.status}' status.`,
      });
    }

    const startYear = new Date(leaveRequest.startDate).getFullYear();

    return this.dataSource.transaction(async (manager) => {
      // Restore pending balance
      const balance = await manager.findOne(LeaveBalanceEntity, {
        where: { employeeId: leaveRequest.employeeId, leaveTypeId: leaveRequest.leaveTypeId, year: startYear },
      });

      if (balance) {
        balance.pendingDays = Math.max(0, Number(balance.pendingDays) - Number(leaveRequest.totalDays));
        await manager.save(balance);
      }

      leaveRequest.status = 'REJECTED';
      leaveRequest.rejectionReason = dto.rejectionReason;
      await manager.save(leaveRequest);

      const approval = manager.create(LeaveApprovalEntity, {
        leaveRequestId,
        approverId: rejectorId,
        step: 'MANAGER',
        status: 'REJECTED',
        comments: dto.rejectionReason,
      });
      await manager.save(approval);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: 'leave.rejected',
        payload: {
          leaveRequestId,
          tenantId,
          employeeId: leaveRequest.employeeId,
          rejectorId,
          reason: dto.rejectionReason,
        },
        processed: false,
      });
      await manager.save(outboxEvent);

      return {
        message: 'Leave request rejected successfully.',
        leaveRequestId,
        status: leaveRequest.status,
      };
    });
  }

  /**
   * HR verifies a MANAGER_APPROVED leave request and converts pending days to used days
   */
  async verifyLeaveRequest(tenantId: string, hrId: string, leaveRequestId: string, dto: ApproveLeaveDto) {
    this.logger.log(`HR verifying leave request: ${leaveRequestId} by HR: ${hrId}`);

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId, tenantId },
    });

    if (!leaveRequest) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Leave request with ID ${leaveRequestId} not found.`,
      });
    }

    if (leaveRequest.status !== 'MANAGER_APPROVED') {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cannot verify leave request in '${leaveRequest.status}' status. Must be 'MANAGER_APPROVED' first.`,
      });
    }

    const startYear = new Date(leaveRequest.startDate).getFullYear();

    return this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(LeaveBalanceEntity, {
        where: { employeeId: leaveRequest.employeeId, leaveTypeId: leaveRequest.leaveTypeId, year: startYear },
      });

      if (balance) {
        balance.pendingDays = Math.max(0, Number(balance.pendingDays) - Number(leaveRequest.totalDays));
        balance.usedDays = Number(balance.usedDays) + Number(leaveRequest.totalDays);
        await manager.save(balance);
      }

      leaveRequest.status = 'HR_VERIFIED';
      await manager.save(leaveRequest);

      const approval = manager.create(LeaveApprovalEntity, {
        leaveRequestId,
        approverId: hrId,
        step: 'HR',
        status: 'VERIFIED',
        comments: dto.comments || 'Verified by HR',
      });
      await manager.save(approval);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: 'leave.verified',
        payload: {
          leaveRequestId,
          tenantId,
          employeeId: leaveRequest.employeeId,
          hrId,
        },
        processed: false,
      });
      await manager.save(outboxEvent);

      return {
        message: 'Leave request verified by HR successfully.',
        leaveRequestId,
        status: leaveRequest.status,
      };
    });
  }

  /**
   * Retrieves leave balances for an employee, auto-seeding defaults if empty
   */
  async getEmployeeLeaveBalances(tenantId: string, employeeId: string) {
    const currentYear = new Date().getFullYear();
    await this.ensureDefaultLeaveTypes(tenantId);

    let balances = await this.leaveBalanceRepo.find({
      where: { employeeId, year: currentYear },
      relations: { leaveType: true },
    });

    if (balances.length === 0) {
      const leaveTypes = await this.leaveTypeRepo.find({ where: { tenantId } });
      const newBalances = leaveTypes.map((lt) =>
        this.leaveBalanceRepo.create({
          employeeId,
          leaveTypeId: lt.id,
          year: currentYear,
          allocatedDays: lt.defaultDaysPerYear,
          usedDays: 0,
          pendingDays: 0,
        }),
      );
      await this.leaveBalanceRepo.save(newBalances);

      balances = await this.leaveBalanceRepo.find({
        where: { employeeId, year: currentYear },
        relations: { leaveType: true },
      });
    }

    return balances;
  }

  /**
   * Retrieves all leave requests for an employee
   */
  async getEmployeeLeaves(tenantId: string, employeeId: string) {
    return this.leaveRequestRepo.find({
      where: { tenantId, employeeId },
      relations: { leaveType: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single leave request by ID
   */
  async getLeaveById(tenantId: string, leaveRequestId: string) {
    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId, tenantId },
      relations: { leaveType: true, approvals: true, employee: true },
    });

    if (!leaveRequest) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Leave request with ID ${leaveRequestId} not found.`,
      });
    }

    return leaveRequest;
  }
}
