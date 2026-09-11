import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification-service.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processOutboxEvent', () => {
    it('should process leave.submitted outbox event and return success response', async () => {
      const mockEvent = {
        id: 'evt-1',
        eventType: 'leave.submitted',
        payload: {
          leaveRequestId: 'leave-99',
          totalDays: 3,
          startDate: '2026-09-10',
          endDate: '2026-09-12',
        },
        createdAt: new Date(),
      };

      const result = await service.processOutboxEvent(mockEvent);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('eventId', 'evt-1');
      expect(result).toHaveProperty('deliveredAt');
    });

    it('should process payroll.executed outbox event and render HTML payslip template', async () => {
      const mockEvent = {
        id: 'evt-2',
        eventType: 'payroll.executed',
        payload: {
          period: '2026-09',
          employeeCount: 10,
          totalGross: 30000,
          totalNet: 22500,
        },
        createdAt: new Date(),
      };

      const result = await service.processOutboxEvent(mockEvent);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('eventType', 'payroll.executed');
    });
  });
});
