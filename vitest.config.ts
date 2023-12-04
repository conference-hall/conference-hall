/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    threads: false,
    setupFiles: ['./tests/setup-tests.ts'],
    include: ['./app/**/*.{test,spec}.ts?(x)', './jobs/**/*.{test,spec}.ts?(x)'],
    reporters: isCI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    watchExclude: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'],
  },
});
