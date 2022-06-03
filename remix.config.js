/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  ignoredRouteFiles: ['**/components/**/*.tsx', '**/hooks/**/*.ts'],
  devServerPort: 8002,
  serverDependenciesToBundle: [/^marked.*/],
};
