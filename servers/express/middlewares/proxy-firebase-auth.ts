import type express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { getWebServerEnv } from 'servers/environment.server.ts';

const { FIREBASE_PROJECT_ID } = getWebServerEnv();

export function applyProxyFirebaseAuth(app: express.Application) {
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
}
