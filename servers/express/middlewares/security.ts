import crypto from 'node:crypto';

import type express from 'express';
import helmet from 'helmet';
import { appUrl } from '~/libs/env/env.server.ts';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export function applySecurity(app: express.Application) {
  // Reduce the ability of attackers to determine the software that a server uses
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
            isDevelopment ? 'ws://127.0.0.1:*' : '',
            isDevelopment ? 'http://127.0.0.1:*' : '',
            isProduction ? '*.googleapis.com' : '',
            "'self'",
          ].filter(Boolean),
          'frame-src': ["'self'", isDevelopment ? 'http://127.0.0.1:*' : ''].filter(Boolean),
          'font-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': [
            "'strict-dynamic'",
            "'self'",
            isProduction ? `${appUrl()}/__/auth/*` : '',
            isProduction ? `${appUrl()}/cdn-cgi/*` : '',
            // @ts-expect-error Helmet types don't seem to know about res.locals
            (_, res) => `'nonce-${res.locals.cspNonce}'`,
          ].filter(Boolean),
          'script-src-attr': [
            // @ts-expect-error Helmet types don't seem to know about res.locals
            (_, res) => `'nonce-${res.locals.cspNonce}'`,
          ],
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );
}
