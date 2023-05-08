import path from 'path';
import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import { createRequestHandler } from '@remix-run/express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { installGlobals } from '@remix-run/node';
import rateLimit from 'express-rate-limit';

installGlobals();

const BUILD_DIR = path.join(process.cwd(), 'build');
const MODE = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

app.use(morgan('tiny'));

// Proxy Firebase authentication
app.use(
  '/__/auth',
  createProxyMiddleware({
    target: `https://${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    changeOrigin: true,
  })
);

// Rate limits
const apiLimiter = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
  message: 'You can only make 5 requests every hour.',
});
app.use('/api', apiLimiter);

// Remix requests
app.all(
  '*',
  MODE === 'production'
    ? createRequestHandler({ build: require(BUILD_DIR), mode: MODE })
    : (...args) => {
        purgeRequireCache();

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: MODE,
        })(...args);
      }
);

app.listen(PORT, () => {
  console.log(`✅ App started on http://localhost:${PORT}`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
