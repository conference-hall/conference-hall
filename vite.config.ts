import mdx from '@mdx-js/rollup';
import { vitePlugin as remix } from '@remix-run/dev';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { expressDevServer } from './servers/express/express-dev-server.ts';

declare module '@remix-run/server-runtime' {
  interface Future {
    v3_singleFetch: true;
  }
}

const withSourcemap = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default defineConfig({
  build: {
    target: 'esnext',
    manifest: true,
    sourcemap: withSourcemap ? 'hidden' : false,
  },
  plugins: [
    expressDevServer(),
    mdx(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_routeConfig: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
    withSourcemap
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: { filesToDeleteAfterUpload: ['build/**/*.map'] },
          release: { name: process.env.RAILWAY_GIT_COMMIT_SHA },
          telemetry: false,
        })
      : undefined,
  ],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
  },
  clearScreen: false,
});
