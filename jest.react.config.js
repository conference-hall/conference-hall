const nodeConfig = require('./jest.node.config');

module.exports = {
  ...nodeConfig,
  displayName: 'React',
  testEnvironment: 'jsdom',
  testMatch: ['**/components/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
