import * as Sentry from '@sentry/react';

export function initMonitoring() {
  if (ENV.NODE_ENV !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.NODE_ENV,
    tracesSampleRate: 1,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      if (event.request?.url) {
        const url = new URL(event.request.url);
        // This error is from a browser extension, ignore it
        if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
          return null;
        }
      }
      return event;
    },
  });
}
