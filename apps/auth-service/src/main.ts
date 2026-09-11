import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('auth-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from '@auth/auth-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigKeys,
  DEFAULT_CONFIG,
  MicroserviceCorrelationInterceptor,
  StructuredLogger,
} from '@app/common';

async function bootstrap() {
  const logger = new StructuredLogger('auth-service');
  const app = await NestFactory.create(AuthServiceModule, { logger });

  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const host = configService.get<string>(
    ConfigKeys.AUTH_SERVICE_HOST,
    DEFAULT_CONFIG[ConfigKeys.AUTH_SERVICE_HOST],
  );
  const port = Number(
    configService.get<number>(
      ConfigKeys.AUTH_SERVICE_PORT,
      DEFAULT_CONFIG[ConfigKeys.AUTH_SERVICE_PORT],
    ),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host,
      port,
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
  logger.log(`🚀 Auth Microservice running on TCP & HTTP metrics on ${host}:${port}`);
}
bootstrap();
