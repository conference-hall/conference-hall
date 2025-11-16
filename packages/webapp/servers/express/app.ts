import { createRequestHandler } from '@react-router/express';
import express, { type Express } from 'express';
import { RouterContextProvider } from 'react-router';
import { nonceContext } from '~/shared/nonce/nonce.server.ts';

export const app: Express = express();

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
    getLoadContext(_, res) {
      const context = new RouterContextProvider();
      context.set(nonceContext, { nonce: res.locals.cspNonce });
      return context;
    },
  }),
);
