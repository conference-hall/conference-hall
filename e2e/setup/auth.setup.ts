import { test as setup } from '@playwright/test';
import { disconnectDB, resetDB } from 'tests/db-helpers.ts';
import { userFactory } from 'tests/factories/users.ts';
import { TEST_USERS, getUserAuthPath } from './helpers.ts';

for (const user of TEST_USERS) {
  setup(`authenticate as ${user}`, async ({ page }) => {
    await resetDB();

    const userData = await userFactory({ traits: [user] });

    await page.goto('/auth/login');
    await page.getByRole('heading', { name: 'Sign in to your account' }).waitFor();
    await page.getByRole('button', { name: 'Google' }).click();

    await page.getByText('Please select an existing account in the Auth Emulator or add a new one:').waitFor();
    await page.getByText(userData.name).click({ delay: 200 });

    await page.getByRole('heading', { name: 'Call for papers for conferences and meetups.' }).waitFor();

    await page.context().storageState({ path: getUserAuthPath(user) });

    await disconnectDB();
  });
}
