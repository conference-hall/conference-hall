import { getSharedServerEnv, loadEnvFile } from '@conference-hall/shared/environment.ts';
import { defineConfig, devices } from '@playwright/test';

// biome-ignore lint/style/noProcessEnv: dotenv not loaded yet
const CI = Boolean(process.env.CI);
loadEnvFile(CI ? '.env.test' : '.env.dev');

const { APP_URL } = getSharedServerEnv();

export default defineConfig({
  testDir: './tests',
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
    { command: 'pnpm -F @conference-hall/webapp jobs:start' },
    {
      command: CI
        ? 'pnpm -F @conference-hall/database migrate:prod && pnpm -F @conference-hall/webapp start'
        : 'pnpm -F @conference-hall/webapp dev:web',
      url: APP_URL,
      reuseExistingServer: !CI,
    },
  ],

  use: {
    baseURL: APP_URL,
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    trace: 'on-first-retry',
  },
});
