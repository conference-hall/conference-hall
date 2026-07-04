import type { FastifyReactRouterOptions } from '@mcansh/react-router-fastify';
import { createServer } from '../web.ts';
import type { RateLimitsOptions } from './rate-limit.ts';

type TestServerOptions = {
  reactRouter?: Partial<FastifyReactRouterOptions>;
  rateLimits?: RateLimitsOptions;
};

// Exercises the real `createServer()` factory without the React Router build:
// static files come from a fixture directory, and a `preHandler` on the catch-all
// route answers before the handler would import the server build.
export async function createTestServer({ reactRouter, rateLimits }: TestServerOptions = {}) {
  return createServer(undefined, {
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
