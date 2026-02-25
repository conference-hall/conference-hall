import { describe, expect, it } from 'vitest';
import { jsonFormatter, prettyFormatter } from './formatters.server.ts';

describe('jsonFormatter', () => {
  it('formats a log entry as JSON with level, message and timestamp', () => {
    const result = JSON.parse(jsonFormatter('info', 'Server started'));

    expect(result).toMatchObject({ level: 'info', message: 'Server started' });
    expect(result.timestamp).toBeDefined();
  });

  it('includes additional data as top-level fields', () => {
    const result = JSON.parse(jsonFormatter('error', 'Request failed', { status: 500, url: '/api' }));

    expect(result).toMatchObject({ level: 'error', message: 'Request failed', status: 500, url: '/api' });
  });

  it('does not allow data to override level, message or timestamp', () => {
    const result = JSON.parse(
      jsonFormatter('error', 'Log message', { message: 'overridden', level: 'debug', timestamp: 'fake' }),
    );

    expect(result.message).toBe('Log message');
    expect(result.level).toBe('error');
    expect(result.timestamp).not.toBe('fake');
  });
});

describe('prettyFormatter', () => {
  it('formats a log entry with level tag and message', () => {
    const result = prettyFormatter('info', 'Server started');

    expect(result).toContain('INFO');
    expect(result).toContain('Server started');
  });

  it('includes additional data as key=value pairs', () => {
    const result = prettyFormatter('warn', 'Slow query', { duration: 150 });

    expect(result).toContain('WARN');
    expect(result).toContain('Slow query');
    expect(result).toContain('duration=150');
  });

  it('does not append data section when data is empty', () => {
    const result = prettyFormatter('debug', 'Ping');
    const resultWithEmpty = prettyFormatter('debug', 'Ping', {});

    expect(result).toEqual(resultWithEmpty);
  });

  it('formats HTTP logs with status, method, url and duration', () => {
    const data = { method: 'GET', url: '/api/events', status: 200, duration: 42 };
    const result = prettyFormatter('info', 'GET /api/events 200', data);

    expect(result).toContain('INFO');
    expect(result).toContain('200');
    expect(result).toContain('GET');
    expect(result).toContain('/api/events');
    expect(result).toContain('42ms');
  });

  it('formats HTTP error logs with red status', () => {
    const data = { method: 'POST', url: '/api/login', status: 500, duration: 10 };
    const result = prettyFormatter('error', 'POST /api/login 500', data);

    expect(result).toContain('500');
    expect(result).toContain('POST');
    expect(result).toContain('/api/login');
    expect(result).toContain('10ms');
  });
});
