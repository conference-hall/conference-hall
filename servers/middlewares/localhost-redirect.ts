import type express from 'express';

const isDevelopment = process.env.NODE_ENV === 'development';

export function applyLocalhostRedirect(app: express.Application) {
  app.use((req, res, next) => {
    if (!isDevelopment) return next();

    const host = req.headers.host;
    if (host?.includes('localhost')) {
      return res.redirect(`${process.env.APP_URL}${req.url}`);
    }
    next();
  });
}
