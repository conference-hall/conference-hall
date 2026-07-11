import { pathToFileURL } from 'node:url';
import fastifyCompress from '@fastify/compress';
import { type FastifyReactRouterOptions, fastifyReactRouter } from '@mcansh/react-router-fastify';
import { type FastifyBaseLogger, type FastifyError, LogController, fastify } from 'fastify';
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
  const app = fastify({
    loggerInstance: (options.loggerInstance ?? baseLogger) as FastifyBaseLogger,
    logController: new LogController({ disableRequestLogging: true }),
  });

  // Make the request logger with request id
  app.addHook('onRequest', (request, _reply, done) => {
    runWithLogger(request.log as Logger, done);
  });

  // Log the response
  app.addHook('onResponse', (request, reply, done) => {
    const status = reply.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    request.log[level](
      {
        method: request.method,
        url: request.url,
        status,
        duration: Math.round(reply.elapsedTime),
        headers: request.headers,
      },
      `${request.method} ${request.url} ${status}`,
    );
    done();
  });

  // Log errors
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

  const processEvents = process.eventNames();
  if (!processEvents.includes('unhandledRejection')) {
    process.on('unhandledRejection', (error) => {
      logger.error({ error }, 'Unhandled Rejection');
    });
  }

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
