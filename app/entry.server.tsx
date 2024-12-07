import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import * as Sentry from '@sentry/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from 'react-router';
import { ServerRouter } from 'react-router';
import { createAppServer } from '../servers/web.server.ts';

import { NonceContext } from './libs/nonce/use-nonce.ts';

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady';

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const nonce = String(loadContext.cspNonce) ?? undefined;
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <ServerRouter context={reactRouterContext} url={request.url} nonce={nonce} />
      </NonceContext.Provider>,
      {
        [callbackName]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
        nonce,
      },
    );

    // Automatically timeout the react renderer
    setTimeout(abort, streamTimeout + 1_000);
  });
}

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (request.signal.aborted) return;
  console.error('Error', error);
  Sentry.captureException(error);
}

export const app = createAppServer();
