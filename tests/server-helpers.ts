import type { FastifyReactRouterOptions } from '@mcansh/react-router-fastify';
import type { Logger } from 'pino';
import type { RateLimitsOptions } from '../servers/fastify/rate-limit.ts';
import { createServer } from '../servers/web.ts';

type TestServerOptions = {
  reactRouter?: Partial<FastifyReactRouterOptions>;
  rateLimits?: RateLimitsOptions;
  loggerInstance?: Logger;
};

// Exercises the real `createServer()` factory without the React Router build:
// static files come from a fixture directory, and a `preHandler` on the catch-all
// route answers before the handler would import the server build.
export async function createTestServer({ reactRouter, rateLimits, loggerInstance }: TestServerOptions = {}) {
  return createServer(undefined, {
    loggerInstance,
    reactRouter: {
      clientBuildDirectory: 'tests/fixtures/client-build',
      routeOptions: {
        preHandler: async (_request, reply) => {
          return reply.send('ok');
        },
      },
      ...reactRouter,
    },
    rateLimits,
  });
}
