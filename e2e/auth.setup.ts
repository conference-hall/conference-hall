import { HomePage } from 'e2e/tests/home.page.ts';
import { LoginPage } from 'e2e/tests/login.page.ts';
import { userFactory } from 'tests/factories/users.ts';
import { test as setup } from './fixtures.ts';
import { TEST_USERS, getUserAuthPath } from './helpers.ts';

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
