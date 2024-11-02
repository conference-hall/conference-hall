import type express from 'express';
import { flags } from '~/libs/feature-flags/flags.server.ts';

export async function applySeoHeader(app: express.Application) {
  const isSeoEnabled = await flags.get('seo');

  if (isSeoEnabled) return;

  app.use((_, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
}
