import type express from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const isCI = process.env.USE_EMULATORS === 'true';

export function applyLocalhostRedirect(app: express.Application) {
  app.use((req, res, next) => {
    if (isProduction && !isCI) return next();

    const host = req.headers.host;
    if (host?.includes('localhost')) {
      return res.redirect(`${process.env.APP_URL}${req.url}`);
    }
    next();
  });
}
