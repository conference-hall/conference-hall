import * as Sentry from '@sentry/node';

export function initMonitoring() {
  if (ENV.NODE_ENV !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.NODE_ENV,
    tracesSampleRate: 1,
    integrations: [Sentry.prismaIntegration()],
  });
}
