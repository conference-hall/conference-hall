import { userFactory } from 'tests/factories/users.ts';
import { loginWith, test } from '../../fixtures.ts';
import { ProfilePage } from './profile.page.ts';

loginWith('clark-kent');

test('display speaker profile', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });

  const profilePage = new ProfilePage(page);
  await profilePage.goto();
});
