/// <reference types="vitest" />
/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { loadEnvironment } from './servers/environment.server.ts';

const env = loadEnvironment();

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { tsconfigPaths: true },
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
          include: ['./**/*.test.ts', './**/*.email.test.tsx', '!./e2e/**/*'],
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
          include: ['./**/*.test.tsx', '!./**/*.email.test.tsx'],
          setupFiles: ['./tests/setup.browser.ts'],
          css: true,
          includeTaskLocation: true,
          browser: {
            enabled: true,
            provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1920, height: 1080 },
            screenshotFailures: false,
          },
          sequence: { groupOrder: 2 },
        },
      },
    ],
    tags: [{ name: 'no-teardown', description: 'Skip global afterEach teardown for test optimization' }],
  },
});
