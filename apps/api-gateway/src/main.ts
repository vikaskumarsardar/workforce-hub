import { initOpenTelemetry } from '@app/common';
initOpenTelemetry('api-gateway');

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiGatewayModule,
    new FastifyAdapter(),
    { logger },
  );

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('WorkforcePulse Enterprise Platform API')
    .setDescription(
      'Global HR, Multi-Tenant Isolation, Leave State Machine & Automated Payroll Engine API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
      'x-tenant-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`🌐 API Gateway (Fastify) listening on http://localhost:${port}`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap();

