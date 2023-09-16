const { flatRoutes } = require('remix-flat-routes');

/** @type {import('@remix-run/dev/config').AppConfig} */
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
