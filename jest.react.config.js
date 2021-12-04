const nodeConfig = require('./jest.node.config')

module.exports = {
  ...nodeConfig,
  displayName: 'React',
  roots: ['app/components'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
