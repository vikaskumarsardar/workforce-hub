import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { OutboxEventEntity } from '../database/entities/outbox-event.entity';
import { NOTIFICATION_SERVICE, PATTERNS } from '../constants/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OutboxRelayService {
  private readonly logger = new Logger(OutboxRelayService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxEventRepo: Repository<OutboxEventEntity>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  /**
   * Background polling loop running every 2,000ms
   */
  @Interval(2000)
  async handleOutboxPolling() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      const pendingEvents = await this.outboxEventRepo.find({
        where: { processed: false, retryCount: LessThan(3) },
        order: { createdAt: 'ASC' },
        take: 20,
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`Found ${pendingEvents.length} unprocessed outbox events. Relaying to Notification Service.`);

      for (const event of pendingEvents) {
        try {
          const result = await firstValueFrom(
            this.notificationClient.send(PATTERNS.NOTIFICATION.PROCESS_OUTBOX_EVENT, {
              id: event.id,
              eventType: event.eventType,
              payload: event.payload,
              createdAt: event.createdAt,
            }),
          );

          if (result?.success) {
            event.processed = true;
            await this.outboxEventRepo.save(event);
            this.logger.log(`Successfully processed & acknowledged outbox event ID: ${event.id}`);
          } else {
            throw new Error(result?.message || 'Notification service returned non-success ACK');
          }
        } catch (err) {
          event.retryCount += 1;
          event.lastError = err.message;
          await this.outboxEventRepo.save(event);
          this.logger.warn(`Failed to relay outbox event ID ${event.id} (Attempt ${event.retryCount}/3): ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Error executing outbox polling relay: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
