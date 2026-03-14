import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { expect, test } from '../../../fixtures.ts';
import { userLoggedFactory } from '../../../helpers.ts';
import { IntegrationsSettingsPage } from './integrations-settings.page.ts';

test('updates integrations settings', async ({ context, page }) => {
  const user = await userLoggedFactory(context);
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const integrationsPage = new IntegrationsSettingsPage(page);

  // Save Slack configuration with invalid URL
  await integrationsPage.goto(team.slug, event.slug);
  await integrationsPage.fill(integrationsPage.slackWebhookInput, 'foo');
  await integrationsPage.saveSlackButton.click();
  const webhookError = await integrationsPage.getInputDescription(integrationsPage.slackWebhookInput);
  await expect(webhookError).toHaveText('Invalid URL');

  // Save Slack configuration with valid URL
  await integrationsPage.fill(integrationsPage.slackWebhookInput, 'http://example.com');
  await integrationsPage.saveSlackButton.click();
  await expect(integrationsPage.slackWebhookInput).toHaveValue('http://example.com');

  // Save OpenPlanner configuration
  await integrationsPage.goto(team.slug, event.slug);
  await integrationsPage.fill(integrationsPage.openPlannerEventIdInput, 'eventId!');
  await integrationsPage.fill(integrationsPage.openPlannerApiKeyInput, 'apiKey!');
  await integrationsPage.saveOpenPlannerButton.click();
  await expect(integrationsPage.toast).toContainText('Integration saved successfully.');

  // Disable OpenPlanner
  await integrationsPage.disableOpenPlannerButton.click();
  await expect(integrationsPage.toast).toContainText('Integration disabled successfully.');
  await expect(integrationsPage.openPlannerEventIdInput).toHaveValue('');
  await expect(integrationsPage.openPlannerApiKeyInput).toHaveValue('');
});
