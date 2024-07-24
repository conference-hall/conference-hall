import type express from 'express';
import morgan from 'morgan';

const isProduction = process.env.NODE_ENV === 'production';
const isCI = process.env.USE_EMULATORS === 'true';

export function applyLogging(app: express.Application) {
  if (!isProduction) {
    app.use(morgan('tiny'));
  }

  if (isProduction && !isCI) {
    app.use(
      morgan((tokens, req, res) => {
        const status = Number(tokens['status'](req, res)) || 0;

        return JSON.stringify({
          level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
          message: `${tokens['method'](req, res)} - ${status} - ${tokens['url'](req, res)}`,
          timestamp: tokens['date'](req, res, 'iso'),
          method: tokens['method'](req, res),
          url: tokens['url'](req, res),
          duration: tokens['response-time'](req, res),
          contentType: tokens.res(req, res, 'content-type'),
          status,
        });
      }),
    );
  }
}
