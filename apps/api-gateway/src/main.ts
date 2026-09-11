import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('api-gateway');

import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from '@gateway/api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfigKeys,
  DEFAULT_CONFIG,
  RpcToHttpExceptionFilter,
  StructuredLogger,
} from '@app/common';

async function bootstrap() {
  const logger = new StructuredLogger('api-gateway');
  const app = await NestFactory.create(ApiGatewayModule, {
    logger,
  });

  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = Number(
    configService.get<number>(
      ConfigKeys.HTTP_PORT,
      DEFAULT_CONFIG[ConfigKeys.HTTP_PORT],
    ),
  );

  app.useGlobalFilters(new RpcToHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  logger.log(`🌐 API Gateway listening on http://localhost:${port}`);
}
bootstrap();
