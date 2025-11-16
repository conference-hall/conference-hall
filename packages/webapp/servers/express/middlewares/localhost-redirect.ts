import { getSharedServerEnv } from '@conference-hall/shared/environment.ts';
import type express from 'express';

const { NODE_ENV, APP_URL } = getSharedServerEnv();

export function applyLocalhostRedirect(app: express.Application) {
  if (NODE_ENV === 'production') return;

  app.use((req, res, next) => {
    const host = req.headers.host;
    if (host?.includes('localhost')) {
      return res.redirect(`${APP_URL}${req.url}`);
    }
    next();
  });
}
