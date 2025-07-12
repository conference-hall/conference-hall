import type express from 'express';
import morgan from 'morgan';
import pc from 'picocolors';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const { NODE_ENV } = getSharedServerEnv();

export function applyLogging(app: express.Application) {
  if (NODE_ENV === 'production') {
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
  } else {
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
  }
}
