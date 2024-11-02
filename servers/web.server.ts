import compression from 'compression';
import express from 'express';
import { createExpressApp } from 'remix-create-express-app';

import { initEnvironment } from '~/libs/env/env.server.ts';
import { initMonitoring } from '~/libs/monitoring/monitoring.server.ts';

import { applyLocalhostRedirect } from './middlewares/localhost-redirect.ts';
import { applyLogging } from './middlewares/logging.ts';
import { applyProxyFirebaseAuth } from './middlewares/proxy-firebase-auth.ts';
import { applyRateLimits } from './middlewares/rate-limit.ts';
import { applySecurity } from './middlewares/security.ts';
import { applySeoHeader } from './middlewares/seo.ts';
import { applyUrlCleaning } from './middlewares/url-cleaning.ts';

declare module '@remix-run/node' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

initEnvironment();
initMonitoring();

export function createAppServer() {
  return createExpressApp({
    configure: async (app) => {
      // dev only: redirect localhost to 127.0.0.1
      applyLocalhostRedirect(app);

      // Request URL cleaning
      applyUrlCleaning(app);

      // Request compression
      app.use(compression());

      // Security (helmet, cspNonce...)
      applySecurity(app);

      // Request logging
      applyLogging(app);

      // Proxy Firebase authentication
      applyProxyFirebaseAuth(app);

      // Rate limits
      applyRateLimits(app);

      // Seo header
      await applySeoHeader(app);

      // Cache assets
      app.use('/fonts', express.static('build/client/fonts', { immutable: true, maxAge: '1y' }));
    },
    // Load context should match the AppLoadContext interface defined above
    getLoadContext: async (_, res) => {
      return { cspNonce: res.locals.cspNonce };
    },
  });
}
