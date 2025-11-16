/// <reference types="vitest" />
import { getSharedServerEnv, loadEnvFile } from '@conference-hall/shared/environment.ts';
import { defineConfig } from 'vitest/config';

const env = loadEnvFile('.env.test');
const { CI } = getSharedServerEnv();

export default defineConfig({
  test: {
    env: env.parsed,
    globals: true,
    mockReset: true,
    reporters: CI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    include: ['./**/*.test.ts'],
    setupFiles: ['./tests/setup-tests.ts'],
    environment: 'node',
    maxWorkers: 1,
    isolate: false,
  },
});
