import type express from 'express';

const isSeoEnabled = process.env.SEO_ENABLED === 'true';

export function applySeoHeader(app: express.Application) {
  if (isSeoEnabled) return;

  app.use((_, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
}
