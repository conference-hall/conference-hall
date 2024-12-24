import type express from 'express';
import morgan from 'morgan';
import pc from 'picocolors';

const isProduction = process.env.NODE_ENV === 'production';
const isCI = process.env.USE_EMULATORS === 'true';

export function applyLogging(app: express.Application) {
  if (!isProduction) {
    app.use(
      morgan((tokens, req, res) => {
        const statusNumber = Number(tokens['status'](req, res)) || 0;
        const status = statusNumber < 400 ? pc.green(statusNumber) : pc.red(statusNumber);
        const method = pc.blueBright(tokens['method'](req, res));
        const url = pc.blueBright(tokens['url'](req, res));
        const duration = pc.gray(`${tokens['response-time'](req, res)}ms`);
        return `${status} - ${method} ${url} ${duration}`;
      }),
    );
    return;
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
          referrer: tokens['referrer'](req, res),
          url: tokens['url'](req, res),
          duration: tokens['response-time'](req, res),
          contentType: tokens.res(req, res, 'content-type'),
          status,
        });
      }),
    );
  }
}