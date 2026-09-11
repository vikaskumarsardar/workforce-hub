import { AsyncLocalStorage } from 'async_hooks';
import { trace, context } from '@opentelemetry/api';

export interface ICorrelationContext {
  correlationId: string;
  traceId?: string;
  spanId?: string;
}

export class CorrelationContext {
  private static readonly storage = new AsyncLocalStorage<ICorrelationContext>();

  /**
   * Runs the given callback within the specified correlation context.
   */
  static run<T>(ctx: ICorrelationContext, fn: () => T): T {
    return this.storage.run(ctx, fn);
  }

  /**
   * Retrieves the active trace ID from OpenTelemetry or AsyncLocalStorage.
   */
  static getTraceId(): string | undefined {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const otelTraceId = activeSpan.spanContext().traceId;
      if (otelTraceId && otelTraceId !== '00000000000000000000000000000000') {
        return otelTraceId;
      }
    }
    return this.storage.getStore()?.traceId;
  }

  /**
   * Retrieves the active span ID from OpenTelemetry context.
   */
  static getSpanId(): string | undefined {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const otelSpanId = activeSpan.spanContext().spanId;
      if (otelSpanId && otelSpanId !== '0000000000000000') {
        return otelSpanId;
      }
    }
    return this.storage.getStore()?.spanId;
  }

  /**
   * Retrieves the current correlation ID, falling back to traceId if available.
   */
  static getCorrelationId(): string {
    const store = this.storage.getStore();
    if (store?.correlationId && store.correlationId !== 'no-correlation-id') {
      return store.correlationId;
    }
    const traceId = this.getTraceId();
    if (traceId) {
      return traceId;
    }
    return 'no-correlation-id';
  }

  /**
   * Returns the entire active context store object.
   */
  static getStore(): ICorrelationContext | undefined {
    return this.storage.getStore();
  }
}
