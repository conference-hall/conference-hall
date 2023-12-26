import { unstable_vitePlugin as remix } from '@remix-run/dev';
import type { RemixVitePluginOptions } from '@remix-run/dev/dist/vite/plugin.js';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const withSentrySourcemap = Boolean(process.env.SENTRY_AUTH_TOKEN);

const config: RemixVitePluginOptions = {
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'esm',
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: ['.*', '**/__components/*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
    });
  },
};

export default defineConfig({
  build: { sourcemap: withSentrySourcemap },
  plugins: [
    remix(config),
    tsconfigPaths(),
    withSentrySourcemap
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: { filesToDeleteAfterUpload: ['build/**/*.map'] },
          telemetry: false,
        })
      : undefined,
  ],
});
