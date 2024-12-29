import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { CfpSettingsPage } from './cfp-settings.page.ts';

loginWith('clark-kent');

test('updates conference CFP settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const cfpPage = new CfpSettingsPage(page);
  await cfpPage.goto(team.slug, event.slug);

  // Update CFP settings
  await cfpPage.startInput.fill('2022-12-12');
  await cfpPage.endInput.fill('2022-12-13');
  await cfpPage.saveOpeningsButton.click();
  await expect(cfpPage.toast).toHaveText('Call for paper updated.');

  // Update CFP preferences
  await cfpPage.maxProposalsInput.fill('3');
  await cfpPage.codeOfConductUrlInput.fill('https://example.com');
  await cfpPage.savePreferencesButton.click();
  await expect(cfpPage.toast).toHaveText('Call for paper updated.');

  // Check if the values are saved
  await page.reload();
  await cfpPage.waitFor();
  await expect(cfpPage.startInput).toHaveValue('2022-12-12');
  await expect(cfpPage.endInput).toHaveValue('2022-12-13');
  await expect(cfpPage.maxProposalsInput).toHaveValue('3');
  await expect(cfpPage.codeOfConductUrlInput).toHaveValue('https://example.com');
});

test('updates meetup CFP settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['meetup-cfp-close'] });

  const cfpPage = new CfpSettingsPage(page);
  await cfpPage.goto(team.slug, event.slug);

  // Update CFP settings
  await cfpPage.cfpActivationSwitch.click();
  await expect(cfpPage.toast).toHaveText('Call for paper updated.');

  // Check if the values are saved
  await page.reload();
  await cfpPage.waitFor();
  await expect(cfpPage.cfpActivationSwitch).toBeChecked();
});
