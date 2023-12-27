import * as Sentry from '@sentry/remix';
import { db } from 'prisma/db.server';

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
    denyUrls: [/\/__\/auth/, /\/assets\//, /\/fonts\//, /\/favicon.ico/, /\/site\.webmanifest/],
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Prisma({ client: db })],
  });
}
