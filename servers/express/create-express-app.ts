import path from 'node:path';
import url from 'node:url';
import { createRequestHandler } from '@remix-run/express';
import type { AppLoadContext, ServerBuild } from '@remix-run/node';
import express, { type Application } from 'express';

type ConfigureFunction = (app: Application) => Promise<void> | void;

type GetLoadContextFunction = (
  req: express.Request,
  res: express.Response,
  args: {
    build: ServerBuild;
  },
) => Promise<AppLoadContext> | AppLoadContext;

type CreateExpressAppArgs = {
  configure: ConfigureFunction;
  getLoadContext: GetLoadContextFunction;
  buildDirectory?: string;
  serverBuildFile?: string;
};

export async function createExpressApp({
  configure,
  getLoadContext,
  buildDirectory = 'build',
  serverBuildFile = 'index.js',
}: CreateExpressAppArgs): Promise<Application> {
  // sourceMapSupport.install({
  //   retrieveSourceMap: (source: any) => {
  //     const match = source.startsWith('file://');
  //     if (match) {
  //       const filePath = url.fileURLToPath(source);
  //       const sourceMapPath = `${filePath}.map`;
  //       if (fs.existsSync(sourceMapPath)) {
  //         return {
  //           url: source,
  //           map: fs.readFileSync(sourceMapPath, 'utf8'),
  //         };
  //       }
  //     }
  //     return null;
  //   },
  // });

  const mode = process.env.NODE_ENV === 'test' ? 'development' : process.env.NODE_ENV;

  const isProductionMode = mode === 'production';

  const app = express();

  // call custom configure function if provided
  await configure(app);

  // Vite fingerprints its assets so we can cache forever.
  app.use(
    '/assets',
    express.static(`${buildDirectory}/client/assets`, {
      immutable: true,
      maxAge: '1y',
    }),
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(
    express.static(isProductionMode ? `${buildDirectory}/client` : 'public', {
      maxAge: '1h',
    }),
  );

  // handle remix requests
  app.all('*', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const build = isProductionMode
      ? await importProductionBuild(buildDirectory, serverBuildFile)
      : await importDevBuild();

    const expressGetLoadContextFunction = (req: any, res: any) => {
      return getLoadContext(req, res, { build }) ?? {};
    };

    return createRequestHandler({
      build,
      mode,
      getLoadContext: expressGetLoadContextFunction,
    })(req, res, next);
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
          server: { middlewareMode: true },
          appType: 'custom',
        }),
      );

function importProductionBuild(buildDirectory: string, serverBuildFile: string) {
  return import(
    /*@vite-ignore*/
    url
      .pathToFileURL(path.resolve(path.join(process.cwd(), `/${buildDirectory}/server/${serverBuildFile}`)))
      .toString()
  ) as Promise<ServerBuild>;
}

function importDevBuild() {
  return viteDevServer?.ssrLoadModule('virtual:remix/server-build') as Promise<ServerBuild>;
}
