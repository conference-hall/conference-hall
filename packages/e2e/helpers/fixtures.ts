import { disconnectDB, resetDB } from '@conference-hall/database/tests/db-helpers.ts';
import { test as base } from '@playwright/test';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { MAILBOX_URL } from '../common/mailbox.page.ts';
import { getUserAuthPath, type TestUser } from './helpers.ts';

// biome-ignore lint: test file
export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    // biome-ignore lint: test file
    async ({}, use) => {
      // This code runs before all the tests in the worker process.
      await resetDB();
      await flags.resetDefaults();

      // Execute the tests.
      await use();

      // This code runs after all the tests in the worker process.
      await disconnectDB();
    },
    { auto: true },
  ],
});

export const loginWith = (user: TestUser) => {
  test.use({ storageState: getUserAuthPath(user) });
};

export async function resetMailbox() {
  await fetch(`${MAILBOX_URL}/api/v1/messages`, { method: 'DELETE' });
}

export { expect } from '@playwright/test';
