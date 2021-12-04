module.exports = {
  displayName: 'Node',
  roots: ['app/firebase', 'app/server', 'app/utils'],
  resetMocks: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts', '@testing-library/jest-dom'],
};
