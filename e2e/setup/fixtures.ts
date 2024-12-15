import { test as base } from '@playwright/test';
import { disconnectDB, resetDB } from 'tests/db-helpers.ts';
import { type TestUser, getUserAuthPath } from './helpers.ts';

// biome-ignore lint: test file
export const test = base.extend<{}, { forEachWorker: void }>({
  forEachWorker: [
    // biome-ignore lint: test file
    async ({}, use) => {
      // This code runs before all the tests in the worker process.
      await resetDB();

      // Execute the tests.
      await use();

      // This code runs after all the tests in the worker process.
      await disconnectDB();
    },
    { scope: 'worker', auto: true },
  ],
});

export const loginWith = (user: TestUser) => {
  test.use({ storageState: getUserAuthPath(user) });
};

export { expect } from '@playwright/test';
