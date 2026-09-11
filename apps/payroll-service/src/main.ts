import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('payroll-service');

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PayrollServiceModule } from '@payroll/payroll-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigKeys,
  DEFAULT_CONFIG,
  MicroserviceCorrelationInterceptor,
  StructuredLogger,
} from '@app/common';

async function bootstrap() {
  const logger = new StructuredLogger('payroll-service');
  const app = await NestFactory.create(PayrollServiceModule, { logger });

  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const host = configService.get<string>(
    ConfigKeys.PAYROLL_SERVICE_HOST,
    DEFAULT_CONFIG[ConfigKeys.PAYROLL_SERVICE_HOST],
  );
  const port = Number(
    configService.get<number>(
      ConfigKeys.PAYROLL_SERVICE_PORT,
      DEFAULT_CONFIG[ConfigKeys.PAYROLL_SERVICE_PORT],
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
  logger.log(`🚀 Payroll Microservice running on TCP & HTTP metrics on ${host}:${port}`);
}
bootstrap();
