import { logger } from '../../app/shared/logger/logger.server.ts';
import { createFastifyLogger } from './logging.ts';
import { createTestServer } from './test-helpers.ts';

describe('createFastifyLogger', { tags: ['no-teardown'] }, () => {
  it('adapts pino argument order (mergeObject, message) to the shared logger (message, data)', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const fastifyLogger = createFastifyLogger();

    fastifyLogger.info({ some: 'value' }, 'a message');

    expect(infoSpy).toHaveBeenCalledWith('a message', { some: 'value' });
  });

  it('accepts message-only calls', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const fastifyLogger = createFastifyLogger();

    fastifyLogger.info('just a message');

    expect(infoSpy).toHaveBeenCalledWith('just a message', {});
  });

  it('maps fatal to error, trace to debug, and silent to a no-op', () => {
    const errorSpy = vi.spyOn(logger, 'error');
    const warnSpy = vi.spyOn(logger, 'warn');
    const infoSpy = vi.spyOn(logger, 'info');
    const debugSpy = vi.spyOn(logger, 'debug');
    const fastifyLogger = createFastifyLogger();

    fastifyLogger.fatal('fatal message');
    fastifyLogger.error('error message');
    fastifyLogger.warn('warn message');
    fastifyLogger.info('info message');
    fastifyLogger.debug('debug message');
    fastifyLogger.trace('trace message');
    fastifyLogger.silent('silent message');

    expect(errorSpy).toHaveBeenCalledWith('fatal message', {});
    expect(errorSpy).toHaveBeenCalledWith('error message', {});
    expect(warnSpy).toHaveBeenCalledWith('warn message', {});
    expect(infoSpy).toHaveBeenCalledWith('info message', {});
    expect(debugSpy).toHaveBeenCalledWith('debug message', {});
    expect(debugSpy).toHaveBeenCalledWith('trace message', {});
    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(2);
  });

  it('exposes the configured level and a child factory', () => {
    const fastifyLogger = createFastifyLogger();

    expect(typeof fastifyLogger.level).toBe('string');
    expect(typeof fastifyLogger.child).toBe('function');
  });

  it('merges child bindings into each log line', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const child = createFastifyLogger().child({ reqId: 'req-42' });
    const grandChild = child.child({ module: 'auth' });

    child.info('with bindings');
    grandChild.info({ some: 'value' }, 'nested');

    expect(infoSpy).toHaveBeenCalledWith('with bindings', { reqId: 'req-42' });
    expect(infoSpy).toHaveBeenCalledWith('nested', { reqId: 'req-42', module: 'auth', some: 'value' });
  });

  it('serializes req, res and err keys to small plain objects', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const errorSpy = vi.spyOn(logger, 'error');
    const fastifyLogger = createFastifyLogger();
    const error = new Error('boom');

    fastifyLogger.info({ req: { method: 'GET', url: '/page', socket: {}, headers: {} } }, 'incoming request');
    fastifyLogger.info({ res: { statusCode: 200, raw: {} }, responseTime: 12.3 }, 'request completed');
    fastifyLogger.error({ err: error }, 'request errored');

    expect(infoSpy).toHaveBeenCalledWith('incoming request', { req: { method: 'GET', url: '/page' } });
    expect(infoSpy).toHaveBeenCalledWith('request completed', { res: { statusCode: 200 }, responseTime: 12.3 });
    expect(errorSpy).toHaveBeenCalledWith('request errored', { err: { message: 'boom', stack: error.stack } });
  });

  it('serializes an Error passed as first argument under the err key', () => {
    const errorSpy = vi.spyOn(logger, 'error');
    const fastifyLogger = createFastifyLogger();
    const error = new Error('boom');

    fastifyLogger.error(error, 'failed');

    expect(errorSpy).toHaveBeenCalledWith('failed', { err: { message: 'boom', stack: error.stack } });
  });

  it('never throws when serializers receive unexpected values', () => {
    const fastifyLogger = createFastifyLogger();
    const trap = new Proxy(
      {},
      {
        get() {
          throw new Error('do not touch');
        },
      },
    );

    expect(() => fastifyLogger.info({ req: trap, res: trap, err: trap }, 'weird')).not.toThrow();
    expect(() => fastifyLogger.info({ req: null, res: 42, err: 'oops' }, 'weird')).not.toThrow();
  });
});

describe('request logging', { tags: ['no-teardown'] }, () => {
  it('logs request-id correlated incoming and completed lines with serialized req/res', async () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const app = await createTestServer();

    await app.inject({ method: 'GET', url: '/some-page' });

    const incoming = infoSpy.mock.calls.find(([message]) => message === 'incoming request');
    const completed = infoSpy.mock.calls.find(([message]) => message === 'request completed');

    expect(incoming?.[1]).toEqual({ reqId: expect.stringMatching(/^req-/), req: { method: 'GET', url: '/some-page' } });
    expect(completed?.[1]).toEqual({
      reqId: incoming?.[1]?.reqId,
      res: { statusCode: 200 },
      responseTime: expect.any(Number),
    });

    await app.close();
  });

  it('logs a warn line when the client aborts the request', async () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    const app = await createTestServer({
      reactRouter: {
        routeOptions: {
          preHandler: async (_request, reply) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return reply.send('ok');
          },
        },
      },
    });

    await app.listen({ port: 0, host: '127.0.0.1' });
    const { port } = app.addresses()[0];

    const controller = new AbortController();
    const request = fetch(`http://127.0.0.1:${port}/slow-page`, { signal: controller.signal });
    setTimeout(() => controller.abort(), 50);
    await expect(request).rejects.toThrow('This operation was aborted');

    await vi.waitFor(() => {
      const aborted = warnSpy.mock.calls.find(([message]) => message === 'GET /slow-page ABORTED');
      expect(aborted?.[1]).toMatchObject({ method: 'GET', url: '/slow-page', aborted: true });
    });

    await app.close();
  });
});
