import { createRequestHandler } from '@remix-run/express';
import { broadcastDevReady, installGlobals } from '@remix-run/node';
import chokidar from 'chokidar';
import closeWithGrace from 'close-with-grace';
import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import path from 'path';

installGlobals();

const BUILD_DIR = path.join(process.cwd(), 'build');
const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

const app = express();

app.use(compression());

// No ending slashes for SEO reasons
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(301, safepath + query);
  } else {
    next();
  }
});

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Everything else (like favicon.ico) is cached for an hour.
app.use(express.static('public', { maxAge: '1h' }));

// Log requests
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
  ENV === 'production'
    ? (req, res, next) => {
        try {
          return createRequestHandler({
            build: require(BUILD_DIR),
            mode: ENV,
          })(req, res, next);
        } catch (error) {
          next(error);
        }
      }
    : createRequestHandler({ build: require(BUILD_DIR), mode: ENV }),
);

// Start the express server
const server = app.listen(PORT, () => {
  console.log(`🚀 App started on http://localhost:${PORT}`);

  if (ENV === 'development') {
    broadcastDevReady(require(BUILD_DIR));
  }
});

// Close the express server gracefully
closeWithGrace(async () => {
  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve('ok')));
  });
});

// during dev, we'll keep the build module up to date with the changes
if (ENV === 'development') {
  const watcher = chokidar.watch(BUILD_DIR, {
    ignored: ['**/**.map'],
  });
  watcher.on('all', () => {
    for (const key in require.cache) {
      if (key.startsWith(BUILD_DIR)) {
        delete require.cache[key];
      }
    }
    broadcastDevReady(require(BUILD_DIR));
  });
}
