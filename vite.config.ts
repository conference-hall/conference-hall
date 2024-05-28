import { vitePlugin as remix } from '@remix-run/dev';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const withSentrySourcemap = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default defineConfig({
  build: { manifest: true },
  plugins: [
    remix({
      serverModuleFormat: 'esm',
      ignoredRouteFiles: ['**/*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: ['.*', '**/__components/*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
        });
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
    withSentrySourcemap
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
  optimizeDeps: { exclude: ['farmhash'] }, // FIXME: Farmhash is not compatible with Vite
});
