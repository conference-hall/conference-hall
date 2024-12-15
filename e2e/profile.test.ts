import { userFactory } from 'tests/factories/users.ts';
import { ProfilePage } from './page-objects/profile.page.ts';
import { loginWith, test } from './setup/fixtures.ts';

loginWith('clark-kent');

test('displays speaker profile', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });

  const profilePage = new ProfilePage(page);
  await profilePage.goto();
});
