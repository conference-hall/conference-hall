import type { FastifyReactRouterOptions } from '@mcansh/react-router-fastify';
import type { Logger } from 'pino';
import { createLogger } from '~/shared/logger/logger.server.ts';
import type { RateLimitsOptions } from '../servers/fastify/rate-limit.ts';
import { createServer } from '../servers/web.ts';

type TestServerOptions = {
  reactRouter?: Partial<FastifyReactRouterOptions>;
  rateLimits?: RateLimitsOptions;
  loggerInstance?: Logger;
};

// `createServer()` factory without the React Router build:
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

// Captures logs as parsed JSON lines instead of spying on the shared logger,
// which is a Proxy and cannot be spied on reliably.
export function createLogCapture() {
  const lines: Array<Record<string, any>> = [];
  const destination = { write: (chunk: string) => void lines.push(JSON.parse(chunk)) };
  const loggerInstance = createLogger({ level: 'info', destination });
  return { lines, loggerInstance };
}
