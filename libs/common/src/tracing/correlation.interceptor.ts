import { ClientProxy } from '@nestjs/microservices';
import { CorrelationContext } from '@app/common/tracing/correlation.context';
import { Observable } from 'rxjs';
import { propagation, context } from '@opentelemetry/api';

/**
 * Attaches active correlationId, traceId, and OTel propagation carrier to outgoing microservice payload object.
 */
export function withCorrelationContext<T extends object>(payload: T): T & {
  _correlationId: string;
  _traceId?: string;
  _carrier?: Record<string, string>;
} {
  const correlationId = CorrelationContext.getCorrelationId();
  const traceId = CorrelationContext.getTraceId();
  const spanId = CorrelationContext.getSpanId();
  const carrier: Record<string, string> = {};

  // Inject active OpenTelemetry context into carrier
  propagation.inject(context.active(), carrier);

  // Fallback guarantee: Ensure traceparent header is set if active traceId exists
  if (!carrier.traceparent && traceId && traceId !== 'no-correlation-id') {
    const validSpanId = spanId || '0000000000000000';
    carrier.traceparent = `00-${traceId}-${validSpanId}-01`;
  }

  return {
    ...(payload || ({} as T)),
    _correlationId: correlationId,
    ...(traceId && { _traceId: traceId }),
    _carrier: carrier,
  };
}

/**
 * Wraps a ClientProxy instance so that all send() and emit() calls automatically attach OTel context & correlationId.
 */
export function wrapClientWithCorrelation(client: ClientProxy): ClientProxy {
  const originalSend = client.send.bind(client);
  const originalEmit = client.emit.bind(client);

  client.send = <TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> => {
    const payload =
      typeof data === 'object' && data !== null
        ? withCorrelationContext(data as object)
        : withCorrelationContext({ data });
    return originalSend(pattern, payload);
  };

  client.emit = <TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult> => {
    const payload =
      typeof data === 'object' && data !== null
        ? withCorrelationContext(data as object)
        : withCorrelationContext({ data });
    return originalEmit(pattern, payload);
  };

  return client;
}

/**
 * Extracts _correlationId from incoming microservice payload and runs the handler within the context.
 */
export function runWithMicroserviceContext<T>(
  payload: any,
  fn: () => T,
): T {
  const correlationId = payload?._correlationId || `micro_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const traceId = payload?._traceId;
  return CorrelationContext.run({ correlationId, traceId }, fn);
}
