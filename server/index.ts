import compression from 'compression';
import { createExpressApp } from 'remix-create-express-app';

import { applyLogging } from './logging.ts';
import { applyProxyFirebaseAuth } from './proxy-firebase-auth.ts';
import { applyRateLimits } from './rate-limit.ts';
import { applySecurity } from './security.ts';
import { applyUrlCleaning } from './url-cleaning.ts';

declare module '@remix-run/node' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

export function createAppServer() {
  return createExpressApp({
    configure: (app) => {
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
    },
    // Load context should match the AppLoadContext interface defined above
    getLoadContext: async (_, res) => {
      return { cspNonce: res.locals.cspNonce };
    },
  });
}
