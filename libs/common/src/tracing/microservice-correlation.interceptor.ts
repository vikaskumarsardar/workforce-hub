import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CorrelationContext } from '@app/common/tracing/correlation.context';
import { trace, context, propagation } from '@opentelemetry/api';

@Injectable()
export class MicroserviceCorrelationInterceptor implements NestInterceptor {
  intercept(execContext: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcData = execContext.switchToRpc().getData();
    const carrier = rpcData?._carrier || {};
    const extractedContext = propagation.extract(context.active(), carrier);

    const correlationId =
      rpcData?._correlationId ||
      `micro_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const incomingTraceId = rpcData?._traceId;

    return new Observable((subscriber) => {
      context.with(extractedContext, () => {
        const activeSpan = trace.getSpan(context.active());
        const otelTraceId = activeSpan?.spanContext().traceId || incomingTraceId;

        if (activeSpan) {
          activeSpan.setAttribute('correlation_id', correlationId);
        }

        CorrelationContext.run(
          {
            correlationId,
            traceId: otelTraceId,
            spanId: activeSpan?.spanContext().spanId,
          },
          () => {
            next.handle().subscribe({
              next: (val) => subscriber.next(val),
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
          },
        );
      });
    });
  }
}
