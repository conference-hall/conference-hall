import { flatRoutes } from 'remix-flat-routes';

/** @type {import('@remix-run/dev/config').AppConfig} */
export default {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'esm',
  serverPlatform: 'node',
  tailwind: true,
  watchPaths: ['./tailwind.config.js'],
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
