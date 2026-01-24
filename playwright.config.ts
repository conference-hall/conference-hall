import { defineConfig, devices } from '@playwright/test';
import { getSharedServerEnv } from './servers/environment.server.ts';

const { APP_URL, CI } = getSharedServerEnv();

export default defineConfig({
  testDir: './e2e',
  outputDir: './node_modules/.playwright/results',
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: 'list',
  timeout: 20000,

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'browser', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],

  webServer: [
    { command: 'npm run jobs:start' },
    {
      command: CI ? 'npm run db:migrate:deploy && npm run start' : 'npm run test:db && npm run dev',
      stderr: CI ? 'ignore' : 'pipe',
      // stdout: 'ignore',
      url: APP_URL,
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
