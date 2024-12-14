import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';

declare module 'react-router' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

export const app = express();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import('virtual:react-router/server-build'),
    getLoadContext(_, res) {
      return { cspNonce: res.locals.cspNonce };
    },
  }),
);
