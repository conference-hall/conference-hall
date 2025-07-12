import dotenv from '@dotenvx/dotenvx';
import { defineConfig, devices } from '@playwright/test';
import { getSharedServerEnv } from './servers/environment.server.ts';

// biome-ignore lint/style/noProcessEnv: dotenv not loaded yet
const CI = Boolean(process.env.CI);
dotenv.config({ path: CI ? '.env.test' : '.env.dev', quiet: true });

const env = getSharedServerEnv();

export default defineConfig({
  testDir: './e2e',
  outputDir: './node_modules/.playwright/results',
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 2 : 1,
  reporter: 'list',
  timeout: 20000,

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'browser', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],

  webServer: [
    { command: 'npm run jobs:start' },
    {
      command: CI ? 'npm run db:migrate:deploy && npm run start' : 'npm run dev',
      url: env.APP_URL,
      reuseExistingServer: !CI,
    },
  ],

  use: {
    baseURL: env.APP_URL,
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    trace: 'on-first-retry',
  },
});
