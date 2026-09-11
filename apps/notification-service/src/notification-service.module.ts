import { Module } from '@nestjs/common';
import { NotificationController } from '@notification/notification-service.controller';
import { NotificationService } from '@notification/notification-service.service';
import { MetricsModule } from '@app/common';

@Module({
  imports: [MetricsModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationServiceModule {}
