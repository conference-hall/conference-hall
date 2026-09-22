import { BullMQOtel } from 'bullmq-otel';

const TRACER_NAME = 'app/bullmq';

export function jobsTelemetry() {
  if (process.env.OTEL_ENABLED !== 'true') return undefined;
  return new BullMQOtel({ tracerName: TRACER_NAME });
}
