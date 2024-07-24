import crypto from 'node:crypto';

import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import { createExpressApp } from 'remix-create-express-app';

// update the AppLoadContext interface used in your app
declare module '@remix-run/node' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

const MODE = process.env.NODE_ENV;
const IS_CI = process.env.USE_EMULATORS === 'true';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

export function createAppServer() {
  return createExpressApp({
    configure: (app) => {
      // /clean-urls/ -> /clean-urls
      app.use((req, res, next) => {
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

      // Security-related HTTP response headers with Helmet
      app.use(
        helmet({
          xPoweredBy: false,
          referrerPolicy: { policy: 'same-origin' },
          crossOriginEmbedderPolicy: false,
          contentSecurityPolicy: {
            reportOnly: true,
            directives: {
              'connect-src': [
                MODE === 'development' ? 'ws://localhost:*' : '',
                MODE === 'development' ? 'http://localhost:*' : '',
                MODE === 'production' ? '*.googleapis.com' : '',
                process.env.SENTRY_DSN ? '*.sentry.io' : '',
                "'self'",
              ].filter(Boolean),
              'frame-src': ["'self'", MODE === 'development' ? 'http://localhost:*' : ''].filter(Boolean),
              'font-src': ["'self'"],
              'img-src': ["'self'", 'data:', 'https:'],
              'script-src': [
                "'strict-dynamic'",
                "'self'",
                // @ts-expect-error Helmet types don't seem to know about res.locals
                (_, res) => `'nonce-${res.locals.cspNonce}'`,
              ],
              'script-src-attr': [
                // @ts-expect-error Helmet types don't seem to know about res.locals
                (_, res) => `'nonce-${res.locals.cspNonce}'`,
              ],
              'upgrade-insecure-requests': null,
            },
          },
        }),
      );

      // Request logging
      if (MODE === 'development') {
        app.use(morgan('tiny'));
      } else if (!IS_CI) {
        app.use(
          morgan((tokens, req, res) => {
            const status = Number(tokens['status'](req, res)) || 0;
            return JSON.stringify({
              level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
              message: `${tokens['method'](req, res)} - ${status} - ${tokens['url'](req, res)}`,
              timestamp: tokens['date'](req, res, 'iso'),
              method: tokens['method'](req, res),
              url: tokens['url'](req, res),
              duration: tokens['response-time'](req, res),
              contentType: tokens.res(req, res, 'content-type'),
              status,
            });
          }),
        );
      }

      // Proxy Firebase authentication
      app.use(
        '/__/auth',
        createProxyMiddleware({
          target: `https://${FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth`,
          changeOrigin: true,
        }),
      );
      app.use(
        '/__/firebase',
        createProxyMiddleware({
          target: `https://${FIREBASE_PROJECT_ID}.firebaseapp.com/__/firebase`,
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

      // Cache static files
      app.use('/fonts', express.static('build/client/fonts', { immutable: true, maxAge: '1y' }));
      app.use('/images', express.static('build/client/images', { immutable: true, maxAge: '1y' }));
      app.use('/favicons', express.static('build/client/favicons', { immutable: true, maxAge: '1y' }));
    },
    getLoadContext: async (req, res) => {
      // custom load context should match the AppLoadContext interface defined above
      return { cspNonce: res.locals.cspNonce };
    },
  });
}
