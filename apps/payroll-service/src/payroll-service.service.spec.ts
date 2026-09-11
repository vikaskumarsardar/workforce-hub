import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { PayrollServiceService } from './payroll-service.service';
import {
  PayrollRunEntity,
  PaySlipEntity,
  PaySlipItemEntity,
  EmployeeEntity,
  CompensationEntity,
  LeaveRequestEntity,
  OutboxEventEntity,
  AuditLogEntity,
  RedisService,
} from '@app/common';
import { DataSource } from 'typeorm';

function getRepositoryToken(entity: any) {
  return `${typeof entity === 'string' ? entity : entity.name}Repository`;
}

describe('PayrollServiceService', () => {
  let service: PayrollServiceService;
  let payrollRunRepo: any;
  let paySlipRepo: any;
  let employeeRepo: any;
  let redisService: any;
  let dataSource: any;

  beforeEach(async () => {
    const mockRepo = () => ({
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-1', ...entity })),
    });

    const mockManager = {
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-saved', ...entity })),
      create: jest.fn((cls, dto) => dto),
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };

    dataSource = {
      transaction: jest.fn((cb) => cb(mockManager)),
    };

    redisService = {
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollServiceService,
        { provide: getRepositoryToken(PayrollRunEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(PaySlipEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(PaySlipItemEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(EmployeeEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(CompensationEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(LeaveRequestEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(OutboxEventEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(AuditLogEntity), useValue: mockRepo() },
        { provide: RedisService, useValue: redisService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<PayrollServiceService>(PayrollServiceService);
    payrollRunRepo = module.get(getRepositoryToken(PayrollRunEntity));
    paySlipRepo = module.get(getRepositoryToken(PaySlipEntity));
    employeeRepo = module.get(getRepositoryToken(EmployeeEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executePayrollRun', () => {
    it('should throw 409 Conflict if Redis distributed lock acquisition fails', async () => {
      redisService.acquireLock.mockResolvedValue(false);

      await expect(
        service.executePayrollRun('tenant-1', 'admin-1', { period: '2026-09' }),
      ).rejects.toThrow(RpcException);

      expect(redisService.acquireLock).toHaveBeenCalled();
    });

    it('should throw 409 Conflict if payroll run for period was already completed', async () => {
      payrollRunRepo.findOne.mockResolvedValue({ id: 'run-1', status: 'COMPLETED' });

      await expect(
        service.executePayrollRun('tenant-1', 'admin-1', { period: '2026-09' }),
      ).rejects.toThrow(RpcException);

      expect(redisService.releaseLock).toHaveBeenCalled();
    });

    it('should execute payroll run, compute gross-to-net math, and release lock', async () => {
      payrollRunRepo.findOne.mockResolvedValue(null);
      employeeRepo.find.mockResolvedValue([
        { id: 'emp-1', tenantId: 'tenant-1', status: 'ACTIVE' },
      ]);

      const result = await service.executePayrollRun('tenant-1', 'admin-1', {
        period: '2026-09',
      });

      expect(result).toHaveProperty('period', '2026-09');
      expect(result).toHaveProperty('totalGross', 3000);
      expect(result).toHaveProperty('totalNet', 2250); // 3000 - 600 (20%) - 150 (5%) = 2250
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(redisService.releaseLock).toHaveBeenCalled();
    });
  });

  describe('getPaySlipById', () => {
    it('should throw 403 Forbidden if requester is not owner and not HR/Admin', async () => {
      paySlipRepo.findOne.mockResolvedValue({
        id: 'slip-1',
        employeeId: 'emp-other',
        payrollRun: { tenantId: 'tenant-1' },
      });

      await expect(
        service.getPaySlipById('tenant-1', 'slip-1', 'emp-1', false),
      ).rejects.toThrow(RpcException);
    });

    it('should return pay slip if requester is owner', async () => {
      const mockSlip = {
        id: 'slip-1',
        employeeId: 'emp-1',
        payrollRun: { tenantId: 'tenant-1' },
      };
      paySlipRepo.findOne.mockResolvedValue(mockSlip);

      const result = await service.getPaySlipById('tenant-1', 'slip-1', 'emp-1', false);
      expect(result).toEqual(mockSlip);
    });
  });
});
