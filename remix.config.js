/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  publicPath: '/build/',
  serverBuildPath: './build/index.js',
  assetsBuildDirectory: './public/build',
  devServerPort: 8002,
  serverDependenciesToBundle: [/^marked.*/, '@sindresorhus/slugify', '@sindresorhus/transliterate'],
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
    v2_meta: true,
  },
};
