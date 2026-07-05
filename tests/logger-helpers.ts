import { createLogger } from '../app/shared/logger/logger.server.ts';

// Captures logs as parsed JSON lines instead of spying on the shared logger,
// which is a Proxy and cannot be spied on reliably.
export function createLogCapture() {
  const lines: Array<Record<string, any>> = [];
  const destination = { write: (chunk: string) => void lines.push(JSON.parse(chunk)) };
  const loggerInstance = createLogger({ level: 'info', destination });
  return { lines, loggerInstance };
}
