import { db } from '@conference-hall/database';
import { getWebServerEnv } from '@conference-hall/shared/environment.ts';
import compression from 'compression';
import express from 'express';
import { disconnectRedis } from '~/shared/cache/redis.server.ts';
import { applyLocalhostRedirect } from './middlewares/localhost-redirect.ts';
import { applyLogging } from './middlewares/logging.ts';
import { applyProxyFirebaseAuth } from './middlewares/proxy-firebase-auth.ts';
import { applyRateLimits } from './middlewares/rate-limit.ts';
import { applySecurity } from './middlewares/security.ts';
import { applySeoHeader } from './middlewares/seo.ts';
import { applyUrlCleaning } from './middlewares/url-cleaning.ts';

const { HOST, PORT } = getWebServerEnv();

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
  await environmentConfig(app);

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });

  // Avoid server crash due to unhandled promise rejections
  const processEvents = process.eventNames();
  if (!processEvents.includes('unhandledRejection')) {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection', promise, reason);
    });
  }

  // Setup graceful shutdown
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    const timeout = setTimeout(() => {
      console.error('❌ Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);

    try {
      console.log(`🔥 Shutting down web server (${signal})`);
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await db.$disconnect();
      await disconnectRedis();
      clearTimeout(timeout);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      clearTimeout(timeout);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}
