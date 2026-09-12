import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('notification-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationServiceModule } from '@notification/notification-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigKeys,
  DEFAULT_CONFIG,
  MicroserviceCorrelationInterceptor,
  StructuredLogger,
} from '@app/common';

async function bootstrap() {
  const logger = new StructuredLogger('notification-service');
  const app = await NestFactory.create(NotificationServiceModule, { logger });

  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const host = configService.get<string>(
    ConfigKeys.NOTIFICATION_SERVICE_HOST,
    DEFAULT_CONFIG[ConfigKeys.NOTIFICATION_SERVICE_HOST],
  );
  const port = Number(
    configService.get<number>(
      ConfigKeys.NOTIFICATION_SERVICE_PORT,
      DEFAULT_CONFIG[ConfigKeys.NOTIFICATION_SERVICE_PORT],
    ),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'notification-service-group',
      },
    },
  });

  app.useGlobalInterceptors(new MicroserviceCorrelationInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(port);
  logger.log(`🚀 Notification Microservice running on TCP & HTTP metrics on ${host}:${port}`);
}
bootstrap();
