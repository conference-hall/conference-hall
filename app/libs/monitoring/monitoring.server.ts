import { ProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/remix';
import { db } from 'prisma/db.server';

export function initMonitoring() {
  if (ENV.MODE !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
    profilesSampleRate: 0.5,
    denyUrls: [/\/assets\//, /\/fonts\//, /\/favicon.ico/, /\/site\.webmanifest/],
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: db }),
      new ProfilingIntegration(),
    ],
  });
}
