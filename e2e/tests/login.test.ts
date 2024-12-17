import { userFactory } from 'tests/factories/users.ts';
import { test } from '../fixtures.ts';
import { LoginPage } from './login.page.ts';
import { ProfilePage } from './speaker/profile.page.ts';

test('log in and redirect', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });

  await page.goto('/speaker/profile');

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.signInWithGoogle(user.name);

  const profilePage = new ProfilePage(page);
  await profilePage.waitFor();

  // TODO: test user menu in dedicated tests (e2e or component)
});
