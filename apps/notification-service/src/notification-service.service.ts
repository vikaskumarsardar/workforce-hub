import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  getHello(): string {
    this.logger.log(`Executing getHello in Notification Service`);
    return 'Hello World!';
  }
}
