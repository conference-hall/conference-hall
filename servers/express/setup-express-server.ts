import compression from 'compression';
import express from 'express';

import { initEnvironment } from '~/libs/env/env.server.ts';
import { initMonitoring } from '~/libs/monitoring/monitoring.server.ts';
import { applyLocalhostRedirect } from './middlewares/localhost-redirect.ts';
import { applyLogging } from './middlewares/logging.ts';
import { applyProxyFirebaseAuth } from './middlewares/proxy-firebase-auth.ts';
import { applyRateLimits } from './middlewares/rate-limit.ts';
import { applySecurity } from './middlewares/security.ts';
import { applySeoHeader } from './middlewares/seo.ts';
import { applyUrlCleaning } from './middlewares/url-cleaning.ts';

initEnvironment();
initMonitoring();

const HOST = process.env.HOST || 'localhost';
const PORT = Number.parseInt(process.env.PORT || '3000');

type EnvironmentConfig = (app: express.Application) => Promise<void>;

export async function setupExpressServer(environmentConfig: EnvironmentConfig) {
  const app = express();

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

  // custom environment configurations
  environmentConfig(app);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });

  // Avoid server crash due to unhandled promise rejections
  const processEvents = process.eventNames();
  if (!processEvents.includes('unhandledRejection')) {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection', promise, reason);
    });
  }
}
