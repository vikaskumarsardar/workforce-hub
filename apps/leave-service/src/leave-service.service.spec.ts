import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { LeaveServiceService } from './leave-service.service';
import {
  LeaveRequestEntity,
  LeaveBalanceEntity,
  LeaveTypeEntity,
  LeaveApprovalEntity,
  OutboxEventEntity,
  AuditLogEntity,
  EmployeeEntity,
} from '@app/common';
import { DataSource } from 'typeorm';

function getRepositoryToken(entity: any) {
  return `${typeof entity === 'string' ? entity : entity.name}Repository`;
}

describe('LeaveServiceService', () => {
  let service: LeaveServiceService;
  let leaveRequestRepo: any;
  let leaveBalanceRepo: any;
  let leaveTypeRepo: any;
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
    };

    dataSource = {
      transaction: jest.fn((cb) => cb(mockManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveServiceService,
        { provide: getRepositoryToken(LeaveRequestEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(LeaveBalanceEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(LeaveTypeEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(LeaveApprovalEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(OutboxEventEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(AuditLogEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(EmployeeEntity), useValue: mockRepo() },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<LeaveServiceService>(LeaveServiceService);
    leaveRequestRepo = module.get(getRepositoryToken(LeaveRequestEntity));
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalanceEntity));
    leaveTypeRepo = module.get(getRepositoryToken(LeaveTypeEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitLeaveRequest', () => {
    it('should throw error for invalid date range', async () => {
      await expect(
        service.submitLeaveRequest('tenant-1', 'emp-1', {
          leaveTypeId: 'type-annual',
          startDate: '2026-09-20',
          endDate: '2026-09-10', // End before Start
        }),
      ).rejects.toThrow(RpcException);
    });

    it('should throw error if requested days exceed available balance', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue({
        id: 'bal-1',
        allocatedDays: 20,
        usedDays: 15,
        pendingDays: 4, // Available: 20 - 15 - 4 = 1 day
      });

      await expect(
        service.submitLeaveRequest('tenant-1', 'emp-1', {
          leaveTypeId: 'type-annual',
          startDate: '2026-09-10',
          endDate: '2026-09-15', // 6 days requested
        }),
      ).rejects.toThrow(RpcException);
    });

    it('should successfully submit leave request and log atomic outbox event', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue({
        id: 'bal-1',
        allocatedDays: 20,
        usedDays: 5,
        pendingDays: 0,
      });

      const result = await service.submitLeaveRequest('tenant-1', 'emp-1', {
        leaveTypeId: 'type-annual',
        startDate: '2026-09-10',
        endDate: '2026-09-12', // 3 days requested
      });

      expect(result).toHaveProperty('status', 'SUBMITTED');
      expect(result).toHaveProperty('totalDays', 3);
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a SUBMITTED leave request', async () => {
      leaveRequestRepo.findOne.mockResolvedValue({
        id: 'leave-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'SUBMITTED',
      });

      const result = await service.approveLeaveRequest('tenant-1', 'manager-1', 'leave-1', {
        comments: 'Looks good',
      });

      expect(result).toHaveProperty('status', 'MANAGER_APPROVED');
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should throw error if request is not in SUBMITTED status', async () => {
      leaveRequestRepo.findOne.mockResolvedValue({
        id: 'leave-1',
        tenantId: 'tenant-1',
        status: 'REJECTED',
      });

      await expect(
        service.approveLeaveRequest('tenant-1', 'manager-1', 'leave-1', {}),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('verifyLeaveRequest', () => {
    it('should HR verify a MANAGER_APPROVED request', async () => {
      leaveRequestRepo.findOne.mockResolvedValue({
        id: 'leave-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        startDate: '2026-09-10',
        totalDays: 3,
        status: 'MANAGER_APPROVED',
      });

      const result = await service.verifyLeaveRequest('tenant-1', 'hr-1', 'leave-1', {
        comments: 'HR Verified',
      });

      expect(result).toHaveProperty('status', 'HR_VERIFIED');
    });

    it('should throw error if request is not in MANAGER_APPROVED status', async () => {
      leaveRequestRepo.findOne.mockResolvedValue({
        id: 'leave-1',
        tenantId: 'tenant-1',
        status: 'SUBMITTED',
      });

      await expect(
        service.verifyLeaveRequest('tenant-1', 'hr-1', 'leave-1', {}),
      ).rejects.toThrow(RpcException);
    });
  });
});
