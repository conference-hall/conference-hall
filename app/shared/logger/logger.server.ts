import { AsyncLocalStorage } from 'node:async_hooks';
import { type DestinationStream, type Logger, type LoggerOptions, pino, stdSerializers } from 'pino';
import { getSharedServerEnv } from '../../../servers/environment.server.ts';

type CreateLoggerOptions = {
  level?: string;
  destination?: DestinationStream;
};

export function createLogger({ level, destination }: CreateLoggerOptions = {}): Logger {
  const { NODE_ENV, LOG_LEVEL } = getSharedServerEnv();

  const options: LoggerOptions = {
    level: level ?? LOG_LEVEL ?? (NODE_ENV === 'test' ? 'silent' : 'info'),
    errorKey: 'error',
    serializers: {
      error: stdSerializers.errWithCause,
      err: stdSerializers.errWithCause,
    },
    redact: { paths: ['headers.cookie', 'headers.authorization'], censor: '[redacted]' },
  };

  if (NODE_ENV === 'development' && !destination) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,reqId,method,url,status,duration,headers',
        messageFormat: '{msg}{if method} {method} {url} {status} {duration}ms{end}',
      },
    };
  }

  return destination ? pino(options, destination) : pino(options);
}

export const baseLogger = createLogger();
const loggerStorage = new AsyncLocalStorage<Logger>();

// Runs `fn` with `contextLogger` as the ambient logger: every `logger` call made
// during its (sync or async) execution is routed to it instead of the base logger.
export function runWithLogger<T>(contextLogger: Logger, fn: () => T): T {
  return loggerStorage.run(contextLogger, fn);
}

export const logger: Logger = new Proxy(baseLogger, {
  get(target, property) {
    const currentLogger = loggerStorage.getStore() ?? target;
    const value = Reflect.get(currentLogger, property, currentLogger);
    return typeof value === 'function' ? value.bind(currentLogger) : value;
  },
});
