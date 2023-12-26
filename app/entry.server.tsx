import { PassThrough } from 'node:stream';

import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

import { initEnvironment } from './libs/env/env.server.ts';
import { initMonitoring } from './libs/monitoring/monitoring.server.ts';
import { NonceContext } from './libs/nonce/useNonce.ts';

initEnvironment();

initMonitoring();

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const callbackName = isbot(request.headers.get('user-agent')!) ? 'onAllReady' : 'onShellReady';

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const nonce = loadContext?.cspNonce as string;
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer abortDelay={ABORT_DELAY} context={remixContext} url={request.url} />
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
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs): void {
  if (request.signal.aborted) return;

  if (error instanceof Error) {
    Sentry.captureRemixServerException(error, 'remix.server', request);
  } else {
    Sentry.captureException(error);
  }
}
