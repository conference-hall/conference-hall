/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [tsconfigPaths()],
  server: { watch: { ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'] } },
  test: {
    globals: true,
    restoreMocks: true,
    reporters: isCI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    workspace: [
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          pool: 'threads',
          poolOptions: { threads: { singleThread: true } },
          include: ['./**/*.test.ts', '!./**/*.test.tsx', '!./e2e/**/*'],
          setupFiles: ['./tests/setup.server.ts'],
        },
      },
      {
        extends: true,
        optimizeDeps: { include: ['react/jsx-dev-runtime'] },
        server: { fs: { strict: false } },
        test: {
          name: 'browser',
          css: true,
          includeTaskLocation: true,
          include: ['./**/*.test.tsx', '!./**/*.test.ts', '!./e2e/**/*'],
          setupFiles: ['./tests/setup.browser.tsx'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1920, height: 1080 },
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
