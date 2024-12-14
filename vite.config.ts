import mdx from '@mdx-js/rollup';
import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const withSourcemap = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    target: 'esnext',
    manifest: true,
    sourcemap: withSourcemap ? 'hidden' : false,
    rollupOptions: isSsrBuild
      ? { input: { app: './servers/express/app.ts', index: './servers/web.prod.ts' } }
      : undefined,
  },
  plugins: [
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
}));
