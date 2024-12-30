import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { IntegrationsSettingsPage } from './integrations-settings.page.ts';

loginWith('clark-kent');

test('updates integrations settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const integrationsPage = new IntegrationsSettingsPage(page);

  // Save Slack configuration with invalid URL
  await integrationsPage.goto(team.slug, event.slug);
  await integrationsPage.fill(integrationsPage.slackWebhookInput, 'foo');
  await integrationsPage.saveSlackButton.click();
  const webhookError = await integrationsPage.getInputDescription(integrationsPage.slackWebhookInput);
  await expect(webhookError).toHaveText('Invalid url');

  // Save Slack configuration with valid URL
  await integrationsPage.fill(integrationsPage.slackWebhookInput, 'http://example.com');
  await integrationsPage.saveSlackButton.click();
  await expect(integrationsPage.slackWebhookInput).toHaveValue('http://example.com');

  // Save OpenPlanner configuration
  await integrationsPage.goto(team.slug, event.slug);
  await integrationsPage.fill(integrationsPage.openPlannerEventIdInput, 'eventId!');
  await integrationsPage.fill(integrationsPage.openPlannerApiKeyInput, 'apiKey!');
  await integrationsPage.saveOpenPlannerButton.click();
  await integrationsPage.goto(team.slug, event.slug);
  await expect(integrationsPage.openPlannerEventIdInput).toHaveValue('eventId!');
  await expect(integrationsPage.openPlannerApiKeyInput).toHaveValue('apiKey!');

  // Disable OpenPlanner
  await integrationsPage.goto(team.slug, event.slug);
  await integrationsPage.disableOpenPlannerButton.click();
  await integrationsPage.goto(team.slug, event.slug);
  await expect(integrationsPage.openPlannerEventIdInput).toHaveValue('');
  await expect(integrationsPage.openPlannerApiKeyInput).toHaveValue('');
});
