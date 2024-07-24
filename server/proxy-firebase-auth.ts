import type express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export function applyProxyFirebaseAuth(app: express.Application) {
  app.use(
    '/__/auth',
    createProxyMiddleware({
      target: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth`,
      changeOrigin: true,
    }),
  );

  app.use(
    '/__/firebase',
    createProxyMiddleware({
      target: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/__/firebase`,
      changeOrigin: true,
    }),
  );
}
