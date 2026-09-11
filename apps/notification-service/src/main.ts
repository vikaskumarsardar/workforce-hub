import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('notification-service');

import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from '@notification/notification-service.module';
import { StructuredLogger } from '@app/common';

async function bootstrap() {
  const logger = new StructuredLogger('notification-service');
  const app = await NestFactory.create(NotificationServiceModule, {
    logger,
  });

  app.useLogger(logger);

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);
  logger.log(`🚀 Notification Service listening on http://localhost:${port}`);
}
bootstrap();
