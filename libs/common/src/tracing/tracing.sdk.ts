import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ConfigKeys, DEFAULT_CONFIG } from '@app/common/config/config.keys';
import { TRACING_INSTRUMENTATIONS } from '@app/common/constants/tracing.constants';
import { IncomingMessage } from 'http';

let sdk: NodeSDK | null = null;

export function initOpenTelemetry(serviceName: string): NodeSDK {
  if (sdk) {
    return sdk;
  }

  const collectorUrl =
    process.env[ConfigKeys.OTEL_EXPORTER_OTLP_ENDPOINT] ||
    DEFAULT_CONFIG[ConfigKeys.OTEL_EXPORTER_OTLP_ENDPOINT];

  const traceExporter = new OTLPTraceExporter({
    url: collectorUrl,
  });

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable filesystem auto-instrumentation to prevent high-cardinality span noise in Tempo/S3
        [TRACING_INSTRUMENTATIONS.FS]: { enabled: false },
        // Ignore /metrics and /health path scrapes from polluting Tempo traces
        [TRACING_INSTRUMENTATIONS.HTTP]: {
          ignoreIncomingRequestHook: (req: IncomingMessage) => {
            const url = req.url || '';
            return url.includes('/metrics') || url.includes('/health');
          },
        },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => console.log('OpenTelemetry SDK terminated'))
      .catch((err) => console.log('Error terminating OTel SDK', err));
  });

  return sdk;
}
