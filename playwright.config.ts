import { defineConfig, devices } from '@playwright/test';
import { getSharedServerEnv } from './servers/environment.server.ts';

const { APP_URL, CI } = getSharedServerEnv();

export default defineConfig({
  testDir: './e2e',
  outputDir: './node_modules/.playwright/results',
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: 'list',
  timeout: 20000,

  projects: [{ name: 'browser', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    { command: 'pnpm jobs:start' },
    {
      command: CI ? 'pnpm db:migrate:deploy && pnpm start' : 'pnpm test:db && pnpm dev',
      url: APP_URL,
      stderr: CI ? 'ignore' : 'pipe',
      // stdout: 'ignore',
    },
  ],

  use: {
    baseURL: APP_URL,
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    trace: 'on-first-retry',
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
});
