/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
    setupFiles: ['./tests/setup-tests.ts'],
    include: ['**/*.test.ts?(x)'],
    reporters: isCI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    restoreMocks: true,
    env: { NODE_ENV: 'test' },
  },
  server: { watch: { ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'] } },
});
