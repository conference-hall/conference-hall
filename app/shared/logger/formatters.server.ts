import pc from 'picocolors';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogData = Record<string, unknown>;
type HttpLogData = { status: number; method: string; url: string; duration: number };

export type LogFormatter = (level: LogLevel, message: string, data?: LogData) => string;

export function jsonFormatter(level: LogLevel, message: string, data?: LogData): string {
  return JSON.stringify({ ...data, level, message, timestamp: new Date().toISOString() });
}

const LEVEL_COLORS: Record<LogLevel, (text: string) => string> = {
  debug: pc.gray,
  info: pc.blue,
  warn: pc.yellow,
  error: pc.red,
};

export function prettyFormatter(level: LogLevel, message: string, data?: LogData): string {
  const color = LEVEL_COLORS[level];
  const tag = color(level.toUpperCase().padEnd(5));

  if (data && isHttpData(data)) {
    return formatHttpLog(tag, data);
  }

  if (data && Object.keys(data).length > 0) {
    return `${tag} ${message} ${formatData(data)}`;
  }
  return `${tag} ${message}`;
}

function isHttpData(data: LogData): data is LogData & HttpLogData {
  return typeof data.status === 'number' && typeof data.method === 'string';
}

function formatHttpLog(tag: string, data: HttpLogData): string {
  const status = data.status < 400 ? pc.green(String(data.status)) : pc.red(String(data.status));
  const method = pc.blueBright(data.method);
  const duration = pc.gray(`${data.duration}ms`);
  return `${tag} ${status} ${method} ${data.url} ${duration}`;
}

function formatData(data: LogData): string {
  const entries = Object.entries(data).map(([key, value]) => {
    if (typeof value === 'string') return `${key}=${value}`;
    return `${key}=${JSON.stringify(value)}`;
  });
  return pc.gray(entries.join(' '));
}
