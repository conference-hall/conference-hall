const { flatRoutes } = require('remix-flat-routes');

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    /^marked.*/,
    '@sindresorhus/slugify',
    '@sindresorhus/transliterate',
    'escape-string-regexp',
  ],
  tailwind: true,
  watchPaths: ['./tailwind.config.js'],
  future: {
    v2_dev: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_errorBoundary: true,
    v2_headers: true,
  },
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: ['.*', '**/components/*', '**/server/*', '**/*.test.{js,jsx,ts,tsx}'],
    });
  },
};
