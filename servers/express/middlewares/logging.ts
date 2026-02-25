import type express from 'express';
import { logger } from '~/shared/logger/logger.server.ts';

export function applyLogging(app: express.Application) {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = process.hrtime.bigint();

    res.on('close', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl;
      const contentType = res.getHeader('content-type') as string | undefined;
      const referrer = req.get('referrer');
      const aborted = !res.writableFinished;
      const message = `${method} ${url} ${aborted ? 'ABORTED' : status}`;

      const data = { method, url, status, duration: Math.round(duration), contentType, referrer, aborted };

      if (status >= 500) {
        logger.error(message, data);
      } else if (aborted || status >= 400) {
        logger.warn(message, data);
      } else {
        logger.info(message, data);
      }
    });

    next();
  });
}
