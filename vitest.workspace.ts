import { defineWorkspace } from 'vitest/config';

// FIX: Temporary workaround for --browser.headless CLI option not working
const isHeadless = process.argv.includes('--browser.headless') || !!process.env.CI;

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
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
    extends: './vitest.config.ts',
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
        headless: isHeadless,
        name: 'chromium',
        provider: 'playwright',
        providerOptions: {},
        viewport: { width: 1920, height: 1080 },
        screenshotFailures: false,
      },
    },
  },
]);
