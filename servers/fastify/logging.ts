import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { logger } from '../../app/shared/logger/logger.server.ts';
import { getSharedServerEnv } from '../environment.server.ts';

const { LOG_LEVEL } = getSharedServerEnv();

type LogData = Record<string, unknown>;
type Serializer = (value: unknown) => unknown;
type Serializers = Record<string, Serializer>;

// Pino-style serializers reducing Fastify request/reply/error objects to small
// plain objects, so the shared logger never receives raw request objects.
// Serializers must never throw: a serialization failure would crash the request.
const defaultSerializers: Serializers = {
  req: safeSerializer((req) => ({
    method: (req as { method?: string }).method,
    url: (req as { url?: string }).url,
  })),
  res: safeSerializer((res) => ({
    statusCode: (res as { statusCode?: number }).statusCode,
  })),
  err: safeSerializer((err) => ({
    message: (err as { message?: string }).message,
    stack: (err as { stack?: string }).stack,
  })),
};

function safeSerializer(serializer: Serializer): Serializer {
  return (value) => {
    if (value === null || typeof value !== 'object') return value;
    try {
      return serializer(value);
    } catch {
      return undefined;
    }
  };
}

// A pino-shaped shim around the shared logger, given to Fastify as `loggerInstance`
// so its internal, plugin, and native request log lines all flow through the shared
// logger's format. Adapts pino's `(mergeObject, message)` argument order to the
// shared logger's `(message, data)` signature, and maps pino-only levels:
// `fatal` -> error, `trace` -> debug, `silent` -> no-op.
export function createFastifyLogger(bindings: LogData = {}, serializers: Serializers = defaultSerializers) {
  function log(level: 'debug' | 'info' | 'warn' | 'error') {
    return (first: unknown, second?: unknown) => {
      const message = typeof first === 'string' ? first : typeof second === 'string' ? second : '';
      const data: LogData = { ...bindings };

      if (first instanceof Error) {
        data.err = serializers.err ? serializers.err(first) : { message: first.message, stack: first.stack };
      } else if (first !== null && typeof first === 'object') {
        for (const [key, value] of Object.entries(first)) {
          const serializer = serializers[key];
          data[key] = serializer ? serializer(value) : value;
        }
      }

      logger[level](message, data);
    };
  }

  const fastifyLogger = {
    level: LOG_LEVEL,
    serializers,
    fatal: log('error'),
    error: log('error'),
    warn: log('warn'),
    info: log('info'),
    debug: log('debug'),
    trace: log('debug'),
    silent: () => {},
    child(childBindings: LogData, options: { serializers?: Serializers } = {}) {
      return createFastifyLogger({ ...bindings, ...childBindings }, { ...serializers, ...options.serializers });
    },
  };

  return fastifyLogger as unknown as FastifyBaseLogger;
}

// Fastify logs "incoming request" and "request completed" lines natively, but stays
// silent when the client aborts the request: keep that warn signal explicit.
export function applyRequestAbortLogging(app: FastifyInstance) {
  app.addHook('onRequestAbort', async (request) => {
    request.log.warn(
      { method: request.method, url: request.url, aborted: true },
      `${request.method} ${request.url} ABORTED`,
    );
  });
}
