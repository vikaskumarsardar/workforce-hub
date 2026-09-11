import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  PayrollRunEntity,
  PaySlipEntity,
  PaySlipItemEntity,
  EmployeeEntity,
  CompensationEntity,
  LeaveRequestEntity,
  OutboxEventEntity,
  AuditLogEntity,
  ExecutePayrollDto,
  RedisService,
} from '@app/common';

@Injectable()
export class PayrollServiceService {
  private readonly logger = new Logger(PayrollServiceService.name);

  constructor(
    @InjectRepository(PayrollRunEntity)
    private readonly payrollRunRepo: Repository<PayrollRunEntity>,
    @InjectRepository(PaySlipEntity)
    private readonly paySlipRepo: Repository<PaySlipEntity>,
    @InjectRepository(PaySlipItemEntity)
    private readonly paySlipItemRepo: Repository<PaySlipItemEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(CompensationEntity)
    private readonly compensationRepo: Repository<CompensationEntity>,
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(OutboxEventEntity)
    private readonly outboxEventRepo: Repository<OutboxEventEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Executes a monthly payroll run with Redis distributed locking, tax withholding math & leave locking
   */
  async executePayrollRun(tenantId: string, actorId: string, dto: ExecutePayrollDto) {
    const lockKey = `lock:payroll:${tenantId}:${dto.period}`;
    this.logger.log(`Attempting to acquire payroll lock: ${lockKey}`);

    const lockAcquired = await this.redisService.acquireLock(lockKey, 300);
    if (!lockAcquired) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Payroll execution for period '${dto.period}' is currently locked or already running by another process.`,
      });
    }

    try {
      // Check if completed run already exists
      const existingRun = await this.payrollRunRepo.findOne({
        where: { tenantId, period: dto.period, status: 'COMPLETED' },
      });

      if (existingRun) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: `Payroll for period '${dto.period}' has already been executed and completed.`,
        });
      }

      // Fetch active employees under tenant
      const activeEmployees = await this.employeeRepo.find({
        where: { tenantId, status: 'ACTIVE' },
      });

      if (activeEmployees.length === 0) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `No active employees found for tenant to process payroll.`,
        });
      }

      // Execute in Database Transaction
      return await this.dataSource.transaction(async (manager) => {
        const payrollRun = manager.create(PayrollRunEntity, {
          tenantId,
          period: dto.period,
          status: 'PROCESSING',
          totalGross: 0,
          totalNet: 0,
        });
        await manager.save(payrollRun);

        let grandTotalGross = 0;
        let grandTotalNet = 0;

        for (const emp of activeEmployees) {
          const comp = await manager.findOne(CompensationEntity, {
            where: { employeeId: emp.id },
          });

          const baseSalary = comp ? Number(comp.baseSalary) : 3000;
          const grossSalary = baseSalary;
          const taxWithholding = Math.round(grossSalary * 0.20 * 100) / 100;
          const healthInsurance = Math.round(grossSalary * 0.05 * 100) / 100;
          const totalDeductions = taxWithholding + healthInsurance;
          const netSalary = grossSalary - totalDeductions;

          grandTotalGross += grossSalary;
          grandTotalNet += netSalary;

          const paySlip = manager.create(PaySlipEntity, {
            payrollRunId: payrollRun.id,
            employeeId: emp.id,
            grossSalary,
            totalDeductions,
            netSalary,
          });
          await manager.save(paySlip);

          const items = [
            manager.create(PaySlipItemEntity, {
              paySlipId: paySlip.id,
              type: 'EARNING',
              name: 'Base Salary',
              amount: grossSalary,
            }),
            manager.create(PaySlipItemEntity, {
              paySlipId: paySlip.id,
              type: 'DEDUCTION',
              name: 'Income Tax (20%)',
              amount: taxWithholding,
            }),
            manager.create(PaySlipItemEntity, {
              paySlipId: paySlip.id,
              type: 'DEDUCTION',
              name: 'Health Insurance (5%)',
              amount: healthInsurance,
            }),
          ];
          await manager.save(items);
        }

        payrollRun.status = 'COMPLETED';
        payrollRun.totalGross = grandTotalGross;
        payrollRun.totalNet = grandTotalNet;
        payrollRun.executedAt = new Date();
        await manager.save(payrollRun);

        // Lock approved leaves for the period to PAYROLL_LOCKED
        const eligibleLeaves = await manager.find(LeaveRequestEntity, {
          where: {
            tenantId,
            status: In(['HR_VERIFIED', 'MANAGER_APPROVED']),
          },
        });

        for (const leave of eligibleLeaves) {
          if (leave.startDate.startsWith(dto.period) || leave.endDate.startsWith(dto.period)) {
            leave.status = 'PAYROLL_LOCKED';
            await manager.save(leave);
          }
        }

        // Write atomic outbox event
        const outboxEvent = manager.create(OutboxEventEntity, {
          eventType: 'payroll.executed',
          payload: {
            payrollRunId: payrollRun.id,
            tenantId,
            period: dto.period,
            totalGross: grandTotalGross,
            totalNet: grandTotalNet,
            employeeCount: activeEmployees.length,
          },
          processed: false,
        });
        await manager.save(outboxEvent);

        // Write audit log
        const auditLog = manager.create(AuditLogEntity, {
          tenantId,
          actorId,
          action: 'PAYROLL_EXECUTED',
          entityType: 'PayrollRun',
          entityId: payrollRun.id,
          newValue: { period: dto.period, totalGross: grandTotalGross, totalNet: grandTotalNet },
        });
        await manager.save(auditLog);

        return {
          message: 'Payroll run executed successfully.',
          payrollRunId: payrollRun.id,
          period: dto.period,
          employeeCount: activeEmployees.length,
          totalGross: grandTotalGross,
          totalNet: grandTotalNet,
        };
      });
    } finally {
      this.logger.log(`Releasing payroll lock: ${lockKey}`);
      await this.redisService.releaseLock(lockKey);
    }
  }

  /**
   * Retrieves all pay slips for a given employee
   */
  async getEmployeePaySlips(tenantId: string, employeeId: string) {
    return this.paySlipRepo.find({
      where: { employeeId },
      relations: { payrollRun: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves pay slip by ID with access control validation
   */
  async getPaySlipById(tenantId: string, paySlipId: string, requesterId: string, isHrOrAdmin: boolean) {
    const paySlip = await this.paySlipRepo.findOne({
      where: { id: paySlipId },
      relations: { payrollRun: true, items: true, employee: true },
    });

    if (!paySlip || paySlip.payrollRun?.tenantId !== tenantId) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Pay slip with ID ${paySlipId} not found under tenant.`,
      });
    }

    if (paySlip.employeeId !== requesterId && !isHrOrAdmin) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access denied to this pay slip.',
      });
    }

    return paySlip;
  }

  /**
   * Retrieves payroll run summary by ID
   */
  async getPayrollRunById(tenantId: string, payrollRunId: string) {
    const run = await this.payrollRunRepo.findOne({
      where: { id: payrollRunId, tenantId },
      relations: { paySlips: true },
    });

    if (!run) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Payroll run with ID ${payrollRunId} not found under tenant.`,
      });
    }

    return run;
  }
}
