import { LoggerService, Injectable } from '@nestjs/common';
import { CorrelationContext } from '@app/common/tracing/correlation.context';

@Injectable()
export class StructuredLogger implements LoggerService {
  constructor(private readonly serviceName: string = 'app-service') {}

  private formatMessage(level: string, message: any, context?: string) {
    const correlationId = CorrelationContext.getCorrelationId();
    const traceId = CorrelationContext.getTraceId();
    const spanId = CorrelationContext.getSpanId();

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      correlationId,
      ...(traceId && { traceId }),
      ...(spanId && { spanId }),
      context: context || this.serviceName,
      message: typeof message === 'object' ? message : String(message),
    });
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(
      this.formatMessage(
        'error',
        typeof message === 'object' ? { ...message, stack: trace } : message,
        context,
      ),
    );
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: any, context?: string) {
    console.debug(this.formatMessage('debug', message, context));
  }

  verbose(message: any, context?: string) {
    console.log(this.formatMessage('verbose', message, context));
  }
}
