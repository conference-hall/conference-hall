import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { SettingsProfilePage } from './settings-profile.page.ts';

useLoginSession();

test('display speaker profile', async ({ page }) => {
  await userFactory({ withPasswordAccount: true, withAuthSession: true });

  const profilePage = new SettingsProfilePage(page);
  await profilePage.goto();

  await profilePage.fillProfile(
    'Speaker biography',
    'Speaker references',
    'New company',
    'New location',
    'https://github.com/my-profile',
  );
  await expect(profilePage.toast).toHaveText('Profile updated.');
});
