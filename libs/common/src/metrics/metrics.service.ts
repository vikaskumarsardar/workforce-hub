import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { CorrelationContext } from '@app/common/tracing/correlation.context';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: client.Registry;

  public readonly httpRequestsTotal: client.Counter<string>;
  public readonly httpRequestDurationSeconds: client.Histogram<string>;
  public readonly microserviceRequestsTotal: client.Counter<string>;
  public readonly microserviceRequestDurationSeconds: client.Histogram<string>;

  constructor() {
    this.registry = new client.Registry();

    client.collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests processed',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.microserviceRequestsTotal = new client.Counter({
      name: 'microservice_requests_total',
      help: 'Total number of TCP microservice requests processed',
      labelNames: ['pattern', 'service', 'status'],
      registers: [this.registry],
    });

    this.microserviceRequestDurationSeconds = new client.Histogram({
      name: 'microservice_request_duration_seconds',
      help: 'TCP microservice request duration in seconds',
      labelNames: ['pattern', 'service', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Default metrics registered
  }

  observeHttpRequest(
    service: string,
    method: string,
    route: string,
    statusCode: number,
    durationInSeconds: number,
  ) {
    const labels = {
      service,
      method,
      route,
      status_code: String(statusCode),
    };

    const traceId = CorrelationContext.getTraceId();

    this.httpRequestsTotal.inc(labels);

    if (traceId) {
      this.httpRequestDurationSeconds.observe(
        {
          labels,
          value: durationInSeconds,
          exemplarLabels: { trace_id: traceId },
        } as any,
      );
    } else {
      this.httpRequestDurationSeconds.observe(labels, durationInSeconds);
    }
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
