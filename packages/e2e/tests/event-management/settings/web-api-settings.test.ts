import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../../helpers/fixtures.ts';
import { WebApiSettingsPage } from './web-api-settings.page.ts';

loginWith('clark-kent');

test('updates web api settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
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
