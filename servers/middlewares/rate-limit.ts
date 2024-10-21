import type express from 'express';
import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

// TODO: use rate limiting in Redis instead of in memory

// Disable rate limiting on dev and test environments
const maxMultiple = isProduction ? 1 : 10_000;

const defaultRateLimit = {
  windowMs: 60 * 1000, // every minutes
  max: 1000 * maxMultiple,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  keyGenerator: (req: express.Request) => {
    // Malicious users can spoof their IP address which means we should not default
    // to trusting req.ip. However, users cannot spoof Cloudflare cf-connecting-ip
    return req.get('cf-connecting-ip') ?? `${req.ip}`;
  },
};

const apiRateLimit = rateLimit({
  ...defaultRateLimit,
  windowMs: 60 * 1000,
  max: 5 * maxMultiple,
});

// const strongestRateLimit = rateLimit({
//   ...defaultRateLimit,
//   windowMs: 60 * 1000,
//   max: 10 * maxMultiple,
// });

// const strongRateLimit = rateLimit({
//   ...defaultRateLimit,
//   windowMs: 60 * 1000,
//   max: 100 * maxMultiple,
// });

// const strongPaths: Array<string> = [];

export function applyRateLimits(app: express.Application) {
  app.use((req, res, next) => {
    // if (req.method !== 'GET' && req.method !== 'HEAD') {
    //   if (strongPaths.some((p) => req.path.includes(p))) {
    //     return strongestRateLimit(req, res, next);
    //   }
    //   return strongRateLimit(req, res, next);
    // }

    // Rate limit for GET /api
    if (req.path.includes('/api')) {
      return apiRateLimit(req, res, next);
    }

    next();
  });
}
