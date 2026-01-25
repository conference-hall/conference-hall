import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../../fixtures.ts';
import { getFileUploadPath } from '../../../helpers.ts';
import { CustomizeSettingsPage } from './customize-settings.page.ts';

loginWith('clark-kent');

test('updates event logo', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const customizePage = new CustomizeSettingsPage(page);
  await customizePage.goto(team.slug, event.slug);

  const fileChooserPromise = page.waitForEvent('filechooser');
  await customizePage.logoInput.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(getFileUploadPath('logo.png'));

  await expect(customizePage.toast).toHaveText('Logo updated.');
  const logoSrc = await customizePage.logoImage.getAttribute('src');
  await expect(logoSrc).toContain('.png');
});
