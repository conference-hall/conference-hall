import express from 'express';
import { setupExpressServer } from './express/setup-express-server.ts';

const BUILD_PATH = './app.js';

await setupExpressServer(async (app) => {
  console.log('🚀 Starting production server');

  app.use('/fonts', express.static('build/client/fonts', { immutable: true, maxAge: '1y' }));
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
  app.use('/locales', express.static('build/client/locales', { immutable: true, maxAge: '1y' }));
  app.use(express.static('build/client', { maxAge: '1h' }));

  app.use(await import(BUILD_PATH).then((mod) => mod.app));
});
