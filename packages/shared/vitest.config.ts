/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { getSharedServerEnv, loadEnvFile } from '../shared/src/environment/environment.ts';

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
    environment: 'node',
  },
});
