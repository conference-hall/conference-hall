import { HomePage } from 'packages/e2e/tests/event-search/home.page.ts';
import { userFactory } from 'tests/factories/users.ts';
import { test as setup } from '../helpers/fixtures.ts';
import { getUserAuthPath, TEST_USERS } from '../helpers/helpers.ts';
import { LoginPage } from './auth/login.page.ts';

for (const user of TEST_USERS) {
  setup(`authenticate as ${user}`, async ({ page }) => {
    const userData = await userFactory({ traits: [user] });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signInWithGoogle(userData.name);

    const homepage = new HomePage(page);
    await homepage.waitFor();

    await page.context().storageState({ path: getUserAuthPath(user) });
  });
}
