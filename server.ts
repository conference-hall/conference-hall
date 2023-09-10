import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { createRequestHandler } from '@remix-run/express';
import type { ServerBuild } from '@remix-run/node';
import { broadcastDevReady, installGlobals } from '@remix-run/node';
import chokidar from 'chokidar';
import closeWithGrace from 'close-with-grace';
import compression from 'compression';
import type { RequestHandler } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';

installGlobals();
run();

const PORT = process.env.PORT || 3000;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

async function run() {
  const BUILD_PATH = path.resolve('build/index.js');
  const initialBuild = await reimportServer();

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

  // Remix fingerprints its assets so we can cache forever.
  app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static('public', { maxAge: '1h' }));

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

  // Remix requests
  app.all(
    '*',
    process.env.NODE_ENV === 'production'
      ? createRequestHandler({
          build: initialBuild,
          mode: process.env.NODE_ENV,
        })
      : createDevRequestHandler(initialBuild),
  );

  // Start the express server
  const server = app.listen(PORT, () => {
    console.log(`✅ app ready: http://localhost:${PORT}`);

    if (process.env.NODE_ENV === 'development') {
      broadcastDevReady(initialBuild);
    }
  });

  // Close the express server gracefully
  closeWithGrace(async () => {
    await new Promise((resolve, reject) => {
      server.close((e) => (e ? reject(e) : resolve('ok')));
    });
  });

  async function reimportServer(): Promise<ServerBuild> {
    // cjs: manually remove the server build from the require cache
    Object.keys(require.cache).forEach((key) => {
      if (key.startsWith(BUILD_PATH)) {
        delete require.cache[key];
      }
    });

    const stat = fs.statSync(BUILD_PATH);

    // convert build path to URL for Windows compatibility with dynamic `import`
    const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

    // use a timestamp query parameter to bust the import cache
    return import(BUILD_URL + '?t=' + stat.mtimeMs);
  }

  function createDevRequestHandler(initialBuild: ServerBuild): RequestHandler {
    let build = initialBuild;
    async function handleServerUpdate() {
      // 1. re-import the server build
      build = await reimportServer();
      // 2. tell Remix that this app server is now up-to-date and ready
      broadcastDevReady(build);
    }
    chokidar.watch(BUILD_PATH, { ignoreInitial: true }).on('add', handleServerUpdate).on('change', handleServerUpdate);

    // wrap request handler to make sure its recreated with the latest build for every request
    return async (req, res, next) => {
      try {
        return createRequestHandler({
          build,
          mode: 'development',
        })(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
}
