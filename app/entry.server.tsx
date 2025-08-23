import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { type RenderToPipeableStreamOptions, renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import type { ActionFunctionArgs, AppLoadContext, EntryContext, LoaderFunctionArgs } from 'react-router';
import { ServerRouter } from 'react-router';
import { NonceContext } from './app-platform/components/use-nonce.ts';
import { initializeI18n } from './shared/i18n/i18n.server.ts';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const i18n = await initializeI18n(request, routerContext);

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

    // Abort the rendering stream after the `streamTimeout` so it has time to flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeout + 1000);

    const nonce = String(loadContext.cspNonce) ?? undefined;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18n}>
        <NonceContext.Provider value={nonce}>
          <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
        </NonceContext.Provider>
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
