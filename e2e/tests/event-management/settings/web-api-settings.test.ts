import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../../fixtures.ts';
import { WebApiSettingsPage } from './web-api-settings.page.ts';

useLoginSession();

test('updates web api settings', async ({ page }) => {
  const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
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
