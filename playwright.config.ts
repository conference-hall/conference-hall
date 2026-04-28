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
    { command: 'npm run jobs:start' },
    {
      command: CI ? 'npm run db:migrate:deploy && npm run start' : 'npm run test:db && npm run dev',
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
