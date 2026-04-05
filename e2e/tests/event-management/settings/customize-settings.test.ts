import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { StorageService } from '~/shared/storage/storage.server.ts';
import { expect, test } from '../../../fixtures.ts';
import { getFileUploadPath, userLoggedFactory } from '../../../helpers.ts';
import { CustomizeSettingsPage } from './customize-settings.page.ts';

test.afterEach(async () => {
  await StorageService.clearBucket();
});

test('updates event logo', async ({ context, page }) => {
  const user = await userLoggedFactory(context);
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
  expect(logoSrc).toContain('.png');
});
