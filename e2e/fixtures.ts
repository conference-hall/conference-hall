import { test as base } from '@playwright/test';
import { disconnectDB, resetDB } from 'tests/db-helpers.ts';
import { resetRedis } from '~/shared/cache/redis.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { MAILBOX_URL } from './common/mailbox.page.ts';

export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    // oxlint-disable-next-line eslint/no-empty-pattern
    async ({}, use) => {
      // This code runs before all the tests in the worker process.
      await resetDB();
      await resetRedis();
      await flags.resetDefaults();

      // Execute the tests.
      await use();

      // This code runs after all the tests in the worker process.
      await disconnectDB();
    },
    { auto: true },
  ],
});

export async function resetMailbox() {
  await fetch(`${MAILBOX_URL}/api/v1/messages`, { method: 'DELETE' });
}

export { expect } from '@playwright/test';
