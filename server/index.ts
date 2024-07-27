import compression from 'compression';
import express from 'express';
import { createExpressApp } from 'remix-create-express-app';

import { applyLocalhostRedirect } from './localhost-redirect.ts';
import { applyLogging } from './logging.ts';
import { applyProxyFirebaseAuth } from './proxy-firebase-auth.ts';
import { applyRateLimits } from './rate-limit.ts';
import { applySecurity } from './security.ts';
import { applySeoHeader } from './seo.ts';
import { applyUrlCleaning } from './url-cleaning.ts';

declare module '@remix-run/node' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

export function createAppServer() {
  return createExpressApp({
    configure: (app) => {
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
      applySeoHeader(app);

      // Cache assets
      app.use('/fonts', express.static('build/client/fonts', { immutable: true, maxAge: '1y' }));
    },
    // Load context should match the AppLoadContext interface defined above
    getLoadContext: async (_, res) => {
      return { cspNonce: res.locals.cspNonce };
    },
  });
}