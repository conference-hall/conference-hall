import crypto from 'node:crypto';

import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';
import * as Sentry from '@sentry/remix';
import closeWithGrace from 'close-with-grace';
import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';

installGlobals({ nativeFetch: true });

run();

async function run() {
  const PORT = process.env.PORT || 3000;
  const MODE = process.env.NODE_ENV;
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

  const vite =
    MODE === 'production'
      ? undefined
      : await import('vite').then(({ createServer }) =>
          createServer({
            server: {
              middlewareMode: true,
            },
          }),
        );

  const app = express();

  app.use((req, res, next) => {
    // /clean-urls/ -> /clean-urls
    if (req.path.endsWith('/') && req.path.length > 1) {
      const query = req.url.slice(req.path.length);
      const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, safepath + query);
      return;
    }
    next();
  });

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable('x-powered-by');

  // Generate a nonce for each request, which we'll use for CSP.
  app.use((_, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString('base64');
    next();
  });

  // Security-related HTTP response headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        reportOnly: true,
        directives: {
          'connect-src': [
            MODE === 'development' ? 'ws:' : null,
            process.env.SENTRY_DSN ? '*.ingest.sentry.io' : null,
            "'self'",
          ].filter(Boolean),
          'font-src': ["'self'"],
          'frame-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': [
            "'strict-dynamic'",
            "'self'",
            // @ts-expect-error Helmet types don't seem to know about res.locals
            (_, res) => `'nonce-${res.locals.cspNonce}'`,
          ],
        },
      },
    }),
  );

  // Request logging
  app.use(morgan('tiny'));

  // Proxy Firebase authentication
  app.use(
    '/__/auth',
    createProxyMiddleware({
      target: `https://${FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth`,
      changeOrigin: true,
    }),
  );

  // Rate limits
  app.use(
    '/api',
    rateLimit({
      max: 5,
      windowMs: 60 * 60 * 1000,
      standardHeaders: true,
      message: 'You can only make 5 requests every hour.',
    }),
  );

  // Handle static assets
  if (vite) {
    app.use(vite.middlewares);
  } else {
    app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
  }
  app.use('/fonts', express.static('build/client/fonts', { immutable: true, maxAge: '1y' }));
  app.use(express.static('build/client', { maxAge: '1h' }));

  // Handle SSR requests
  const _createRequestHandler = vite
    ? createRequestHandler
    : Sentry.wrapExpressCreateRequestHandler(createRequestHandler);

  app.all(
    '*',
    _createRequestHandler({
      build: vite ? () => vite.ssrLoadModule('virtual:remix/server-build') : await import('./build/server/index.js'),
      getLoadContext: (req, res) => ({ cspNonce: res.locals.cspNonce }),
      mode: MODE,
    }),
  );

  // Start the express server
  const server = app.listen(PORT, () => {
    console.log('\n--------------------------------------------------\n');
    console.log(`🌍 Environment: ${MODE}`);
    console.log('\n--------------------------------------------------\n');
    if (MODE === 'development') {
      console.log(`🤖 Emulators  >  http://localhost:4000`);
      console.log(`💌 Mailpit    >  http://localhost:8025`);
    }
    console.log(`🚀 Web app    >  http://localhost:${PORT}`);
    console.log('\n--------------------------------------------------\n');
  });

  // Close the express server gracefully
  closeWithGrace(async () => {
    await new Promise((resolve, reject) => {
      console.log('Shutting down the express server...');
      server.close((e) => (e ? reject(e) : resolve('ok')));
    });
  });
}
