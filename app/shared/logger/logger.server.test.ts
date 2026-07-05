import { createLogCapture } from 'tests/server-helpers.ts';
import { describe, expect, it } from 'vitest';
import { createLogger, logger, runWithLogger } from './logger.server.ts';

describe('createLogger', () => {
  it('is silent by default in test environment', () => {
    const testLogger = createLogger();

    expect(testLogger.level).toBe('silent');
  });

  it('serializes errors with message, stack and cause under the "error" key', () => {
    const { lines, loggerInstance } = createLogCapture();
    const error = new Error('boom', { cause: new Error('root cause') });

    loggerInstance.error({ error }, 'Operation failed');

    expect(lines[0].msg).toBe('Operation failed');
    expect(lines[0].error.message).toBe('boom');
    expect(lines[0].error.stack).toContain('boom');
    expect(lines[0].error.cause.message).toBe('root cause');
  });

  it('redacts cookie and authorization request headers', () => {
    const { lines, loggerInstance } = createLogCapture();

    loggerInstance.info(
      { headers: { cookie: 'session=secret', authorization: 'Bearer token', accept: 'text/html' } },
      'request completed',
    );

    expect(lines[0].headers.cookie).toBe('[redacted]');
    expect(lines[0].headers.authorization).toBe('[redacted]');
    expect(lines[0].headers.accept).toBe('text/html');
  });
});

describe('logger context', () => {
  it('delegates to the context logger inside runWithLogger', () => {
    const { lines, loggerInstance } = createLogCapture();
    const contextLogger = loggerInstance.child({ reqId: 'req-123' });

    runWithLogger(contextLogger, () => logger.info('inside context'));

    expect(lines[0]).toMatchObject({ reqId: 'req-123', msg: 'inside context' });
  });

  it('keeps the context across async boundaries', async () => {
    const { lines, loggerInstance } = createLogCapture();
    const contextLogger = loggerInstance.child({ reqId: 'req-456' });

    await runWithLogger(contextLogger, async () => {
      await Promise.resolve();
      logger.info('after await');
    });

    expect(lines[0]).toMatchObject({ reqId: 'req-456', msg: 'after await' });
  });

  it('falls back to the base logger outside a context', () => {
    const { lines, loggerInstance } = createLogCapture();
    const contextLogger = loggerInstance.child({ reqId: 'req-789' });

    runWithLogger(contextLogger, () => logger.info('inside'));
    logger.info('outside');

    expect(lines).toHaveLength(1);
    expect(lines[0].msg).toBe('inside');
  });
});
