import { ProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/remix';
import { db } from 'prisma/db.server';

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    tracesSampleRate: ENV.MODE === 'production' ? 1 : 0,
    denyUrls: [
      /\/resources\/healthcheck/,
      /\/build\//,
      /\/favicons\//,
      /\/img\//,
      /\/fonts\//,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: db }),
      new ProfilingIntegration(),
    ],
  });
}
