import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

const CI = Boolean(process.env.CI);

if (CI) {
  dotenv.config({ path: path.resolve(import.meta.dirname, '.env.e2e') });
} else {
  dotenv.config({ path: path.resolve(import.meta.dirname, '.env.dev') });
}

const APP_URL = process.env.APP_URL;

export default defineConfig({
  testDir: './e2e',
  outputDir: './node_modules/.playwright/results',
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? 'dot' : 'list',

  projects: [
    { name: 'setup', testMatch: /setup\/.*\.setup\.ts/ },
    { name: 'browser', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],

  webServer: {
    command: CI ? 'npm run start' : 'npm run dev',
    url: APP_URL,
    reuseExistingServer: !CI,
  },

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },
});
