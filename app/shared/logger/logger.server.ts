import { getSharedServerEnv } from '../../../servers/environment.server.ts';
import { type LogFormatter, jsonFormatter, prettyFormatter } from './formatters.server.ts';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogData = Record<string, unknown>;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const CONSOLE_METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

interface Logger {
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
}

function createLogger(): Logger {
  const { NODE_ENV, LOG_LEVEL } = getSharedServerEnv();
  const minPriority = LOG_LEVEL_PRIORITY[LOG_LEVEL];
  const formatter: LogFormatter = NODE_ENV === 'production' ? jsonFormatter : prettyFormatter;

  function log(level: LogLevel, message: string, data?: LogData): void {
    if (LOG_LEVEL_PRIORITY[level] < minPriority) return;

    const serialized = data ? serializeData(data) : undefined;
    console[CONSOLE_METHOD[level]](formatter(level, message, serialized));
  }

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  };
}

function serializeData(data: LogData): LogData {
  const serialized: LogData = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Error) {
      serialized[key] = serializeError(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
}

function serializeError(error: unknown): LogData {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }

  const serialized: LogData = { message: error.message };

  if (error.stack) {
    serialized.stack = error.stack;
  }

  if (error.cause) {
    serialized.cause = serializeError(error.cause);
  }

  return serialized;
}

export const logger: Logger = createLogger();
