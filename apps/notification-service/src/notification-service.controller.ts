import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from '@notification/notification-service.service';
import { PATTERNS } from '@app/common';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getHello(): string {
    this.logger.log(`Handling GET / request in Notification Service`);
    return this.notificationService.getHello();
  }

  @MessagePattern(PATTERNS.NOTIFICATION.PROCESS_OUTBOX_EVENT)
  async handleProcessOutboxEvent(@Payload() event: any) {
    this.logger.log(`Received RPC '${PATTERNS.NOTIFICATION.PROCESS_OUTBOX_EVENT}' for event ID: ${event?.id}`);
    return this.notificationService.processOutboxEvent(event);
  }
}
