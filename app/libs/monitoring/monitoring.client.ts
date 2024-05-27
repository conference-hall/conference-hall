import { useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

export function initMonitoring() {
  if (ENV.MODE !== 'production') return;
  if (!ENV.SENTRY_DSN) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    tracesSampleRate: 1,
    integrations: [Sentry.browserTracingIntegration({ useEffect, useLocation, useMatches })],
  });
}
