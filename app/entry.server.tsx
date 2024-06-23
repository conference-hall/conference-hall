import { PassThrough } from 'node:stream';

import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

import { initEnvironment } from './libs/env/env.server.ts';
import { initMonitoring } from './libs/monitoring/monitoring.server.ts';
import { NonceContext } from './libs/nonce/use-nonce.ts';

initEnvironment();

initMonitoring();

const ABORT_DELAY = 5_000;

// Reject all pending promises from handler functions after 5 seconds
export const streamTimeout = 5_000;

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
    const nonce = String(loadContext.cspNonce) ?? undefined;
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer abortDelay={ABORT_DELAY} context={remixContext} url={request.url} nonce={nonce} />
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

    // Automatically timeout the react renderer after 10 seconds
    setTimeout(abort, 10_000);
  });
}

export function handleError(error: unknown, { request, params, context }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (!request.signal.aborted) {
    console.error(error);
    // @ts-expect-error
    Sentry.sentryHandleError(error, { request, params, context });
  }
}
