import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { loadEnvironment } from './environment.server.ts';

// A global, not a module variable: under `react-router dev` the server module is loaded through
// Vite's SSR graph, a different module instance from the one the --import flag evaluates.
declare global {
  var __otelSdk: NodeSDK | undefined;
}

export function startOtel(defaultServiceName: string) {
  loadEnvironment();

  if (process.env.OTEL_ENABLED !== 'true') return;

  process.env.OTEL_METRICS_EXPORTER = 'none';
  process.env.OTEL_LOGS_EXPORTER = 'none';

  const serviceName = process.env.OTEL_SERVICE_NAME || defaultServiceName;

  const sdk = new NodeSDK({
    serviceName,
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      new HttpInstrumentation({ disableIncomingRequestInstrumentation: true }),
      new UndiciInstrumentation(),
      new PrismaInstrumentation({ ignoreSpanTypes: ['prisma:client:serialize', 'prisma:client:compile'] }),
    ],
  });

  sdk.start();
  globalThis.__otelSdk = sdk;

  console.log(`[otel] tracing enabled (service=${serviceName})`);
}

export function shutdownOtel() {
  return globalThis.__otelSdk?.shutdown();
}
