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
    build: () => import('virtual:react-router/server-build'),
    getLoadContext(_, res) {
      return { cspNonce: res.locals.cspNonce };
    },
  }),
);
