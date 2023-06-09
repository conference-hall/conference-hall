/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    /^marked.*/,
    '@sindresorhus/slugify',
    '@sindresorhus/transliterate',
    'escape-string-regexp',
  ],
  tailwind: true,
  future: {
    unstable_dev: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_errorBoundary: true,
    v2_headers: true,
  },
};
