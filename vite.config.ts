import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { expressDevServer } from './servers/express/express-dev-server.ts';

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
    reactRouter(),
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
