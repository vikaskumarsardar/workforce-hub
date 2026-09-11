import { Controller, Get, Logger } from '@nestjs/common';
import { NotificationService } from '@notification/notification-service.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getHello(): string {
    this.logger.log(`Handling GET / request in Notification Service`);
    return this.notificationService.getHello();
  }
}
