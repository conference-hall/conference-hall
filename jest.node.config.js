module.exports = {
  displayName: 'Node',
  roots: ['app'],
  resetMocks: true,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/components/'],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
};
