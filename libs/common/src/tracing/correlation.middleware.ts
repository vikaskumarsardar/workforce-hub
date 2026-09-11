import { Injectable, NestMiddleware, Optional } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationContext } from '@app/common/tracing/correlation.context';
import { MetricsService } from '@app/common/metrics/metrics.service';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(
    @Optional() private readonly metricsService?: MetricsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const activeSpan = trace.getSpan(context.active());
    const otelTraceId = activeSpan?.spanContext().traceId;

    const headerCorrelationId = req.headers['x-correlation-id'] as string;
    const correlationId =
      headerCorrelationId ||
      (otelTraceId && otelTraceId !== '00000000000000000000000000000000'
        ? otelTraceId
        : `req_${Date.now()}_${Math.floor(Math.random() * 100000)}`);

    res.setHeader('x-correlation-id', correlationId);

    if (activeSpan) {
      activeSpan.setAttribute('correlation_id', correlationId);
    }

    res.on('finish', () => {
      if (this.metricsService) {
        const durationInSeconds = (Date.now() - startTime) / 1000;
        const route = req.route?.path || req.path || 'unknown';
        this.metricsService.observeHttpRequest(
          'api-gateway',
          req.method,
          route,
          res.statusCode,
          durationInSeconds,
        );
      }
    });

    CorrelationContext.run(
      {
        correlationId,
        traceId: otelTraceId,
        spanId: activeSpan?.spanContext().spanId,
      },
      () => {
        next();
      },
    );
  }
}
