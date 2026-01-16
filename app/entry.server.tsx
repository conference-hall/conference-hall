import type { ActionFunctionArgs, EntryContext, LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { PassThrough } from 'node:stream';
import { type RenderToPipeableStreamOptions, renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { ServerRouter } from 'react-router';
import { getI18n } from './shared/i18n/i18n.middleware.ts';
import { nonceContext } from './shared/nonce/nonce.server.ts';
import { Nonce } from './shared/nonce/use-nonce.ts';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  routerContext: RouterContextProvider,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || entryContext.isSpaMode ? 'onAllReady' : 'onShellReady';

    // Abort the rendering stream after the `streamTimeout` so it has time to flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeout + 1000);

    const { nonce } = routerContext.get(nonceContext);

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={getI18n(routerContext)}>
        <Nonce.Provider value={nonce}>
          <ServerRouter context={entryContext} url={request.url} nonce={nonce} />
        </Nonce.Provider>
      </I18nextProvider>,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
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
  });
}

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (request.signal.aborted) return;
  console.error('Error', error);
}
