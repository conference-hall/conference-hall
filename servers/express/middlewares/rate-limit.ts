import type express from 'express';
import rateLimit from 'express-rate-limit';
import { href } from 'react-router';

const isProduction = process.env.NODE_ENV === 'production' && !process.env.USE_EMULATORS;

// Disable rate limiting on dev and test environments
const maxMultiple = isProduction ? 1 : 10_000;

const defaultRateLimit = {
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
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60 * maxMultiple,
});

const strongRateLimit = rateLimit({
  ...defaultRateLimit,
  windowMs: 60 * 1000, // 1 minute
  max: 10 * maxMultiple,
});

const securedPaths = [href('/auth/login'), href('/auth/forgot-password'), href('/speaker/settings'), href('/admin')];

export function applyRateLimits(app: express.Application) {
  app.use((req, res, next) => {
    // Rate limit for GET /api/
    if (req.path.startsWith('/api/')) {
      return apiRateLimit(req, res, next);
    }
    // Rate limit for secured paths
    if (req.method !== 'GET' && req.method !== 'HEAD' && securedPaths.some((p) => req.path.includes(p))) {
      return strongRateLimit(req, res, next);
    }
    next();
  });
}
