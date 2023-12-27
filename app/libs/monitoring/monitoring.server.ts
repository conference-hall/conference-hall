import * as Sentry from '@sentry/remix';
import { db } from 'prisma/db.server';

export function initMonitoring() {
  if (ENV.MODE !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: db })],
  });
}
