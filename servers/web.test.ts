import { createLogCapture, createTestServer } from '../tests/server-helpers.ts';

describe('web server', { tags: ['no-teardown'] }, () => {
  it('logs a single request line with request details', async () => {
    const { lines, loggerInstance } = createLogCapture();
    const app = await createTestServer({ loggerInstance });

    const response = await app.inject({
      method: 'GET',
      url: '/speaker/talks',
      headers: { cookie: 'session=secret', authorization: 'Bearer token' },
    });

    expect(response.statusCode).toBe(200);
    const requestLogs = lines.filter((line) => line.method);
    expect(requestLogs).toHaveLength(1);
    expect(requestLogs[0]).toMatchObject({
      level: 30,
      method: 'GET',
      url: '/speaker/talks',
      status: 200,
    });
    expect(requestLogs[0].msg).toBeUndefined();
    expect(requestLogs[0].reqId).toBeDefined();
    expect(requestLogs[0].duration).toBeTypeOf('number');
    expect(requestLogs[0].headers.cookie).toBe('[redacted]');
    expect(requestLogs[0].headers.authorization).toBe('[redacted]');

    await app.close();
  });

  it('logs errors thrown in hooks and answers 500', async () => {
    const { lines, loggerInstance } = createLogCapture();
    const app = await createTestServer({
      loggerInstance,
      reactRouter: {
        routeOptions: {
          preHandler: () => {
            throw new Error('boom');
          },
        },
      },
    });

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ message: 'Internal Server Error' });
    const errorLogs = lines.filter((line) => line.msg === 'Web server error');
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].error.message).toBe('boom');
    expect(errorLogs[0].reqId).toBeDefined();
    expect(lines.find((line) => line.method)?.level).toBe(50);

    await app.close();
  });

  it('keeps client error status codes untouched', async () => {
    const { lines, loggerInstance } = createLogCapture();
    const app = await createTestServer({
      loggerInstance,
      reactRouter: {
        routeOptions: {
          preHandler: () => {
            const error = new Error('Teapot') as Error & { statusCode: number };
            error.statusCode = 418;
            throw error;
          },
        },
      },
    });

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(418);
    expect(lines.filter((line) => line.msg === 'Web server error')).toHaveLength(0);
    expect(lines.find((line) => line.method)?.level).toBe(40);

    await app.close();
  });
});
