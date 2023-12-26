import { useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

export function initMonitoring() {
  if (ENV.MODE !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1, // Set tracesSampleRate to 0.1 to capture 10%
    profilesSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
      }),
      new Sentry.BrowserProfilingIntegration(),
    ],
  });
}
