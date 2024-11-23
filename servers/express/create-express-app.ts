import * as fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequestHandler } from '@remix-run/express';
import type { AppLoadContext, ServerBuild } from '@remix-run/node';
import express, { type Application } from 'express';
import sourceMapSupport from 'source-map-support';

type ConfigureFunction = (app: Application) => Promise<void> | void;
type GetLoadContextFunction = (req: express.Request, res: express.Response) => Promise<AppLoadContext> | AppLoadContext;
type CreateExpressAppArgs = { configure: ConfigureFunction; getLoadContext: GetLoadContextFunction };

const BUILD_DIR = 'build';
const SERVER_BUILD_FILE = 'index.js';

const mode = process.env.NODE_ENV === 'test' ? 'development' : process.env.NODE_ENV;
const isProductionMode = mode === 'production';

export async function createExpressApp({ configure, getLoadContext }: CreateExpressAppArgs): Promise<Application> {
  // Install source map support
  sourceMapSupport.install({
    retrieveSourceMap: (source: any) => {
      const match = source.startsWith('file://');
      if (match) {
        const filePath = url.fileURLToPath(source);
        const sourceMapPath = `${filePath}.map`;
        if (fs.existsSync(sourceMapPath)) {
          return {
            url: source,
            map: fs.readFileSync(sourceMapPath, 'utf8'),
          };
        }
      }
      return null;
    },
  });

  // Create the express app
  const app = express();

  // Apply web server configuration
  await configure(app);

  // Vite fingerprints its assets so we can cache forever.
  app.use('/assets', express.static(`${BUILD_DIR}/client/assets`, { immutable: true, maxAge: '1y' }));

  // Everything else (like favicon.ico) is cached for an hour.
  app.use(express.static(isProductionMode ? `${BUILD_DIR}/client` : 'public', { maxAge: '1h' }));

  // Handle remix requests
  app.all('*', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const build = isProductionMode ? await importProductionBuild() : await importDevBuild();
    return createRequestHandler({ build, mode, getLoadContext })(req, res, next);
  });

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? 'localhost';

  if (isProductionMode) {
    // check if server is an https/http2 server
    const isSecureServer = !!('cert' in app && app.cert);

    app.listen(port, () => {
      const url = new URL(`${isSecureServer ? 'https' : 'http'}://${host}`);
      // setting port this way because it will not explicitly set the port
      // if it's the default port for the protocol
      url.port = String(port);
      console.log(`Express server listening at ${url}`);
    });
  }

  return app;
}

// This server is only used to load the dev server build
const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true, ws: false },
          appType: 'custom',
        }),
      );

function importProductionBuild() {
  return import(
    /*@vite-ignore*/
    url
      .pathToFileURL(path.resolve(path.join(process.cwd(), `/${BUILD_DIR}/server/${SERVER_BUILD_FILE}`)))
      .toString()
  ) as Promise<ServerBuild>;
}

function importDevBuild() {
  return viteDevServer?.ssrLoadModule('virtual:remix/server-build') as Promise<ServerBuild>;
}
