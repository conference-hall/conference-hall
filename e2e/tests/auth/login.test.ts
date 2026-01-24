import { href } from 'react-router';
import { DEFAULT_PASSWORD, userFactory } from 'tests/factories/users.ts';
import { test } from '../../fixtures.ts';
import { SettingsProfilePage } from '../speaker/settings-profile.page.ts';
import { LoginPage } from './login.page.ts';

test('log in with password and redirect', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'], withPasswordAccount: true });

  await page.goto(href('/speaker/settings/profile'));

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.signInWithPassword(user.email, DEFAULT_PASSWORD);

  const profilePage = new SettingsProfilePage(page);
  await profilePage.waitFor();
});
