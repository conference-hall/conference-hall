import { userFactory } from 'tests/factories/users.ts';
import { LoginPage } from './page-objects/login.page.ts';
import { ProfilePage } from './page-objects/profile.page.ts';
import { test } from './setup/fixtures.ts';

test('log in and redirect', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });

  await page.goto('/speaker/profile');

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.signInWithGoogle(user.name);

  const profilePage = new ProfilePage(page);
  await profilePage.waitFor();

  // TODO: test user menu
});
