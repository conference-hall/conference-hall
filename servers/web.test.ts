import { logger } from '../app/shared/logger/logger.server.ts';
import { createTestServer } from './fastify/test-helpers.ts';

describe('web server', { tags: ['no-teardown'] }, () => {
  it('logs errors thrown in hooks and answers 500', async () => {
    const app = await createTestServer({
      reactRouter: {
        routeOptions: {
          preHandler: () => {
            throw new Error('boom');
          },
        },
      },
    });
    const errorSpy = vi.spyOn(logger, 'error');

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ message: 'Internal Server Error' });
    expect(errorSpy).toHaveBeenCalledWith('Web server error', { error: expect.objectContaining({ message: 'boom' }) });

    await app.close();
  });

  it('keeps client error status codes untouched', async () => {
    const app = await createTestServer({
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
    const errorSpy = vi.spyOn(logger, 'error');

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(418);
    expect(errorSpy).not.toHaveBeenCalled();

    await app.close();
  });
});
