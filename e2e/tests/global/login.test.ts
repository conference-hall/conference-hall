import { href } from 'react-router';
import { userFactory } from 'tests/factories/users.ts';
import { test } from '../../fixtures.ts';
import { ProfilePage } from '../speaker/profile.page.ts';
import { LoginPage } from './login.page.ts';

test('log in with Google and redirect', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });

  await page.goto(href('/speaker/settings/profile'));

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.signInWithGoogle(user.name);

  const profilePage = new ProfilePage(page);
  await profilePage.waitFor();
});
