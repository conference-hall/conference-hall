import type express from 'express';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const env = getSharedServerEnv();

const isProduction = env.NODE_ENV === 'production';

export function applyLocalhostRedirect(app: express.Application) {
  if (isProduction) return;

  app.use((req, res, next) => {
    const host = req.headers.host;
    if (host?.includes('localhost')) {
      return res.redirect(`${env.APP_URL}${req.url}`);
    }
    next();
  });
}
