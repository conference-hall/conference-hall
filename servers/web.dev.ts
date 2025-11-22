import { setupExpressServer } from './express/setup-express-server.ts';

const APP_PATH = './servers/express/app.ts';

await setupExpressServer(async (app) => {
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );

  app.use(viteDevServer.middlewares);

  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule(APP_PATH);
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
});
