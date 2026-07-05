import { pathToFileURL } from 'node:url';
import fastifyCompress from '@fastify/compress';
import { type FastifyReactRouterOptions, fastifyReactRouter } from '@mcansh/react-router-fastify';
import { type FastifyBaseLogger, type FastifyError, fastify } from 'fastify';
import type { Logger } from 'pino';
import { RouterContextProvider } from 'react-router';
import type { ViteDevServer } from 'vite';
import { nonceContext } from '#nonce';
import { baseLogger, logger, runWithLogger } from '../app/shared/logger/logger.server.ts';
import { getWebServerEnv } from './environment.server.ts';
import { type RateLimitsOptions, applyRateLimits } from './fastify/rate-limit.ts';
import { applySecurity } from './fastify/security.ts';
import { applySeoHeader } from './fastify/seo.ts';
import { staticCacheHeaders } from './fastify/static.ts';
import { applyUrlCleaning } from './fastify/url-cleaning.ts';

const { HOST, PORT } = getWebServerEnv();

type CreateServerOptions = {
  reactRouter?: Partial<FastifyReactRouterOptions>;
  rateLimits?: RateLimitsOptions;
  loggerInstance?: Logger;
};

export async function createServer(vite?: ViteDevServer, options: CreateServerOptions = {}) {
  // Native request logging is disabled: a single "request completed" line is
  // emitted by the `onResponse` hook below instead of the incoming/completed pair.
  const app = fastify({
    loggerInstance: (options.loggerInstance ?? baseLogger) as FastifyBaseLogger,
    disableRequestLogging: true,
  });

  // Make the request logger (carrying the reqId) the ambient logger for the whole request
  app.addHook('onRequest', (request, _reply, done) => {
    runWithLogger(request.log as Logger, done);
  });

  app.addHook('onResponse', (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        status: reply.statusCode,
        duration: Math.round(reply.elapsedTime),
        headers: request.headers,
      },
      'request completed',
    );
    done();
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      request.log.error({ error }, 'Web server error');
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
    return reply.status(statusCode).send({ message: error.message });
  });

  // Request URL cleaning
  applyUrlCleaning(app);

  // Response compression
  await app.register(fastifyCompress);

  // Security
  await applySecurity(app);

  // Rate limits
  await applyRateLimits(app, options.rateLimits);

  // Seo header
  await applySeoHeader(app);

  // React Router request handler, serving the client build statically in production.
  // Translations are served by the locales resource route, not a static mount.
  const clientBuildDirectory = options.reactRouter?.clientBuildDirectory ?? 'build/client';
  await app.register(fastifyReactRouter, {
    devServer: vite,
    getLoadContext(_request, reply) {
      const context = new RouterContextProvider();
      context.set(nonceContext, { nonce: reply.cspNonce.script });
      return context;
    },
    staticOptions: staticCacheHeaders(clientBuildDirectory),
    ...options.reactRouter,
  });

  return app;
}

const isMain = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const app = await createServer();

  // Avoid server crash due to unhandled promise rejections
  const processEvents = process.eventNames();
  if (!processEvents.includes('unhandledRejection')) {
    process.on('unhandledRejection', (error) => {
      logger.error({ error }, 'Unhandled Rejection');
    });
  }

  // Graceful shutdown: drain in-flight requests, then exit. The process exit tears down
  // database and Redis sockets, so no explicit disconnects are needed here.
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    const timeout = setTimeout(() => {
      logger.error('❌ Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10_000);

    logger.info(`🔥 Shutting down web server (${signal})`);
    try {
      await app.close();
      clearTimeout(timeout);
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during graceful shutdown');
      clearTimeout(timeout);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  await app.listen({ port: PORT, host: HOST });
  logger.info(`🚀 Server is running on http://${HOST}:${PORT}`);
}
