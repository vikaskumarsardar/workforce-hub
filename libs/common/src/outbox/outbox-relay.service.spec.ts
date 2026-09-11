import { Test, TestingModule } from '@nestjs/testing';
import { OutboxRelayService } from './outbox-relay.service';
import { OutboxEventEntity } from '../database/entities/outbox-event.entity';
import { NOTIFICATION_SERVICE } from '../constants/services';
import { of, throwError } from 'rxjs';

function getRepositoryToken(entity: any) {
  return `${typeof entity === 'string' ? entity : entity.name}Repository`;
}

describe('OutboxRelayService', () => {
  let service: OutboxRelayService;
  let repo: any;
  let notificationClient: any;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    notificationClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxRelayService,
        { provide: getRepositoryToken(OutboxEventEntity), useValue: repo },
        { provide: NOTIFICATION_SERVICE, useValue: notificationClient },
      ],
    }).compile();

    service = module.get<OutboxRelayService>(OutboxRelayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleOutboxPolling', () => {
    it('should query pending outbox events and mark them processed on success ACK', async () => {
      const mockEvent = {
        id: 'event-1',
        eventType: 'leave.submitted',
        payload: { leaveRequestId: 'leave-101' },
        processed: false,
        retryCount: 0,
        createdAt: new Date(),
      };

      repo.find.mockResolvedValue([mockEvent]);
      notificationClient.send.mockReturnValue(of({ success: true }));

      await service.handleOutboxPolling();

      expect(repo.find).toHaveBeenCalled();
      expect(notificationClient.send).toHaveBeenCalled();
      expect(mockEvent.processed).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(mockEvent);
    });

    it('should increment retryCount and set lastError on notification failure', async () => {
      const mockEvent: any = {
        id: 'event-2',
        eventType: 'payroll.executed',
        payload: { period: '2026-09' },
        processed: false,
        retryCount: 0,
        lastError: undefined,
        createdAt: new Date(),
      };

      repo.find.mockResolvedValue([mockEvent]);
      notificationClient.send.mockReturnValue(throwError(() => new Error('TCP connection failed')));

      await service.handleOutboxPolling();

      expect(mockEvent.processed).toBe(false);
      expect(mockEvent.retryCount).toBe(1);
      expect(mockEvent.lastError).toBe('TCP connection failed');
      expect(repo.save).toHaveBeenCalledWith(mockEvent);
    });
  });
});
