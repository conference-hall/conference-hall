import crypto from 'node:crypto';
import type express from 'express';
import helmet from 'helmet';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const { NODE_ENV, APP_URL } = getSharedServerEnv();

const isProduction = NODE_ENV === 'production';

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
            !isProduction ? 'ws://127.0.0.1:*' : '',
            !isProduction ? 'http://127.0.0.1:*' : '',
            isProduction ? '*.googleapis.com' : '',
            "'self'",
          ].filter(Boolean),
          'frame-src': [
            "'self'",
            'https://challenges.cloudflare.com',
            !isProduction ? 'http://127.0.0.1:*' : '',
          ].filter(Boolean),
          'font-src': ["'self'", 'data:'],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': [
            "'strict-dynamic'",
            "'unsafe-eval'",
            "'self'",
            // @ts-expect-error Helmet types don't seem to know about res.locals
            (_, res) => `'nonce-${res.locals.cspNonce}'`,
          ].filter(Boolean),
          'script-src-elem': [
            "'self'",
            isProduction ? `${APP_URL}/__/auth/*` : '',
            isProduction ? `${APP_URL}/cdn-cgi/*` : '',
            'https://challenges.cloudflare.com',
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
