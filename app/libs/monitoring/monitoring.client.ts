import { useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

export function initMonitoring() {
  if (ENV.MODE !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
      }),
      // Replay is only available in the client
      new Sentry.Replay(),
      new Sentry.BrowserProfilingIntegration(),
    ],

    // Set tracesSampleRate to 0.1 to capture 10%
    tracesSampleRate: 0.1,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
