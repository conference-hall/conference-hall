/// <reference types="vitest" />
/// <reference types="vite/client" />

import dotenv from '@dotenvx/dotenvx';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { getSharedServerEnv } from './servers/environment.server.ts';

const env = dotenv.config({ path: '.env.test', quiet: true });

const { CI } = getSharedServerEnv();

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: { watch: { ignored: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'] } },
  test: {
    globals: true,
    restoreMocks: true,
    env: env.parsed,
    reporters: CI ? ['default', 'junit'] : 'default',
    outputFile: './test-results/unit.xml',
    projects: [
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
          testTimeout: 5_000,
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
