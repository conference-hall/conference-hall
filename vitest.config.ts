/// <reference types="vitest" />
/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { loadEnvironment } from './servers/environment.server.ts';

const env = loadEnvironment();

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: { watch: { ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'] } },
  test: {
    env,
    globals: true,
    mockReset: true,
    reporters: env.CI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    projects: [
      {
        extends: true,
        test: {
          name: 'server',
          include: ['./**/*.test.ts', '!./**/*.test.tsx', '!./e2e/**/*'],
          setupFiles: ['./tests/setup.server.ts'],
          environment: 'node',
          isolate: false,
          maxWorkers: 1,
          sequence: { groupOrder: 1 },
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['./**/*.test.tsx', '!./**/*.test.ts', '!./e2e/**/*'],
          setupFiles: ['./tests/setup.browser.tsx'],
          css: true,
          includeTaskLocation: true,
          testTimeout: 5_000,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1920, height: 1080 },
            screenshotFailures: false,
          },
          sequence: { groupOrder: 2 },
        },
      },
    ],
  },
});
