import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { expect, test } from '../../../fixtures.ts';
import { userLoggedFactory } from '../../../helpers.ts';
import { WebApiSettingsPage } from './web-api-settings.page.ts';

test('updates web api settings', async ({ context, page }) => {
  const user = await userLoggedFactory(context);
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const webApiPage = new WebApiSettingsPage(page);
  await webApiPage.goto(team.slug, event.slug);

  // Default value
  await expect(webApiPage.apiKeyInput).toHaveValue('');

  // Generate API key
  await webApiPage.generateAPIKeyButton.click();
  await expect(webApiPage.revokeAPIKeyButton).toBeVisible();
  await expect(webApiPage.apiKeyInput).not.toHaveValue('');

  // Revoke API key
  await webApiPage.revokeAPIKeyButton.click();
  await expect(webApiPage.generateAPIKeyButton).toBeVisible();
  await expect(webApiPage.apiKeyInput).toHaveValue('');
});
