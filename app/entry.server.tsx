import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from 'react-router';
import { ServerRouter } from 'react-router';
import { initializeI18n } from './libs/i18n/i18n.server.ts';
import { NonceContext } from './libs/nonce/use-nonce.ts';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady';

  const i18n = await initializeI18n(request, reactRouterContext);

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const nonce = String(loadContext.cspNonce) ?? undefined;
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18n}>
        <NonceContext.Provider value={nonce}>
          <ServerRouter context={reactRouterContext} url={request.url} nonce={nonce} />
        </NonceContext.Provider>
      </I18nextProvider>,
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
}
