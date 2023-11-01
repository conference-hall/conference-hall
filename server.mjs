import crypto from 'node:crypto';
import path from 'node:path';
import url from 'node:url';

import { unstable_createViteServer, unstable_loadViteServerBuild } from '@remix-run/dev';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';
import closeWithGrace from 'close-with-grace';
import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import sourceMapSupport from 'source-map-support';

sourceMapSupport.install();
installGlobals();
run();

async function serverBuild() {
  const buildPath = path.resolve('build/index.js');
  const buildUrl = url.pathToFileURL(buildPath).href;
  return import(buildUrl);
}

async function run() {
  const PORT = process.env.PORT || 3000;
  const ENV = process.env.NODE_ENV;
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

  const vite = ENV === 'production' ? undefined : await unstable_createViteServer();

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
          'connect-src': [ENV === 'development' ? 'ws:' : null, "'self'"].filter(Boolean),
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
      target: `https://${FIREBASE_PROJECT_ID}.firebaseapp.com`,
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
    app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));
  }
  app.use('/fonts', express.static('public/fonts', { immutable: true, maxAge: '1y' }));
  app.use(express.static('public', { maxAge: '1h' }));

  // Handle SSR requests
  app.all(
    '*',
    createRequestHandler({
      build: vite ? () => unstable_loadViteServerBuild(vite) : await serverBuild(),
      getLoadContext: (req, res) => ({ cspNonce: res.locals.cspNonce }),
      mode: ENV,
    }),
  );

  // Start the express server
  const server = app.listen(PORT, () => {
    console.log('\n--------------------------------------------------\n');
    console.log(`🌍 Environment: ${ENV}`);
    console.log('\n--------------------------------------------------\n');
    if (ENV === 'development') {
      console.log(`🤖 Emulators  >  http://localhost:4000`);
      console.log(`💌 Mailpit    >  http://localhost:8025`);
    }
    console.log(`🚀 Web app    >  http://localhost:${PORT}`);
    console.log('\n--------------------------------------------------\n');
  });

  // Close the express server gracefully
  closeWithGrace(async () => {
    await new Promise((resolve, reject) => {
      server.close((e) => (e ? reject(e) : resolve('ok')));
    });
  });
}
