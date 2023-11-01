import { unstable_vitePlugin as remix } from '@remix-run/dev';
import type { RemixVitePluginOptions } from '@remix-run/dev/dist/vite/plugin.js';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: RemixVitePluginOptions = {
  // cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'esm',
  // serverPlatform: 'node',
  // tailwind: true,
  // watchPaths: ['./tailwind.config.ts'],
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: [
        '.*',
        '**/__components/*',
        '**/__server/*',
        '**/__types/*',
        '**/*.css',
        '**/*.test.{js,jsx,ts,tsx}',
      ],
    });
  },
};

export default defineConfig({
  plugins: [remix(config), tsconfigPaths()],
});
