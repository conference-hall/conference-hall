import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { ProfilePage } from './profile.page.ts';

loginWith('clark-kent');

test('display speaker profile', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });

  const profilePage = new ProfilePage(page);
  await profilePage.goto();

  await profilePage.fillPersonalInfoForm('John Doe', 'john.doe@email.com', 'https://john-doe.com/photo.jpg');
  await expect(profilePage.toast).toHaveText('Profile updated.');

  await profilePage.goto();
  await profilePage.fillPersonalInfoForm('', '', '');
  await expect(await profilePage.fullNameError()).toHaveText('Required');
  await expect(await profilePage.emailError()).toHaveText('Required');

  await profilePage.goto();
  await profilePage.fillSpeakerDetails('Speaker biography', 'Speaker references');
  await expect(profilePage.toast).toHaveText('Profile updated.');

  await profilePage.goto();
  await profilePage.fillAdditionalInfo('New company', 'New location', 'New twitter', 'New github');
  await expect(profilePage.toast).toHaveText('Profile updated.');
});
