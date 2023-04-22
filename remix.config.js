/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  serverDependenciesToBundle: [/^marked.*/, '@sindresorhus/slugify', '@sindresorhus/transliterate'],
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_errorBoundary: true,
  },
};
