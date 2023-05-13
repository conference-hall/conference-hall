/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    threads: false,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup-tests.ts'],
    exclude: ['./cypress', './node_modules'],
    watchExclude: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'],
    reporters: isCI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
  },
});
