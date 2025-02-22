import type express from 'express';
import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

const API_WINDOW_MS = 60 * 1000; // 1h
const API_MAX_CALLS = 60;

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
  windowMs: API_WINDOW_MS,
  max: API_MAX_CALLS,
});
export function applyRateLimits(app: express.Application) {
  app.use((req, res, next) => {
    // Rate limit for GET /api/
    if (req.path.startsWith('/api/')) {
      return apiRateLimit(req, res, next);
    }
    next();
  });
}
