import { AsyncLocalStorage } from 'node:async_hooks';
import { type DestinationStream, type Logger, type LoggerOptions, pino, stdSerializers } from 'pino';
import pinoPretty from 'pino-pretty';
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
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: { paths: ['headers.cookie', 'headers.authorization'], censor: '[redacted]' },
  };

  if (NODE_ENV === 'development' && !destination) {
    return pino(options, createPrettyStream());
  }

  return destination ? pino(options, destination) : pino(options);
}

function createPrettyStream(): DestinationStream {
  return pinoPretty({
    singleLine: true,
    ignore: 'time,pid,hostname,reqId,method,url,status,duration,headers',
    messageFormat: (log, messageKey, _level, { colors }) => {
      if (isHttpLog(log)) {
        const request = colors.blueBright(`${log.method} ${log.url}`);
        const statusColor = log.status >= 500 ? colors.red : log.status >= 400 ? colors.yellow : colors.green;
        const status = statusColor(String(log.status));
        const duration = colors.gray(`${log.duration ?? 0}ms`);
        return `${request} ${status} ${duration}`;
      }
      return String(log[messageKey] ?? '');
    },
  });
}

type HttpLog = { method: string; url: string; status: number; duration?: number };

function isHttpLog(log: Record<string, unknown>): log is Record<string, unknown> & HttpLog {
  return typeof log.method === 'string' && typeof log.url === 'string' && typeof log.status === 'number';
}

export const baseLogger = createLogger();

const loggerStorage = new AsyncLocalStorage<Logger>();

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
