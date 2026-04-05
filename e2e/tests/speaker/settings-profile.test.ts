import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { SettingsProfilePage } from './settings-profile.page.ts';

test('display speaker profile', async ({ page, context }) => {
  await userLoggedFactory(context);

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
