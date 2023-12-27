import { useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
      }),
    ],
  });
}
