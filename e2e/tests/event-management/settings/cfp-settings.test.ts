import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../../fixtures.ts';
import { CfpSettingsPage } from './cfp-settings.page.ts';

useLoginSession();

test('updates conference CFP settings', async ({ page }) => {
  const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const cfpPage = new CfpSettingsPage(page);

  // Update CFP settings
  await cfpPage.goto(team.slug, event.slug);
  await cfpPage.fill(cfpPage.startInput, '2022-01-01');
  await cfpPage.fill(cfpPage.endInput, '2022-02-02');
  await cfpPage.saveOpeningsButton.click();
  await expect(cfpPage.toast).toHaveText('Call for papers updated.');

  // Update CFP preferences
  await cfpPage.goto(team.slug, event.slug);
  await cfpPage.fill(cfpPage.maxProposalsInput, '3');
  await cfpPage.fill(cfpPage.codeOfConductUrlInput, 'https://example.com');
  await cfpPage.savePreferencesButton.click();
  await expect(cfpPage.toast).toHaveText('Call for papers updated.');

  // Check if the values are saved
  await cfpPage.goto(team.slug, event.slug);
  await expect(cfpPage.startInput).toHaveValue('2022-01-01');
  await expect(cfpPage.endInput).toHaveValue('2022-02-02');
  await expect(cfpPage.maxProposalsInput).toHaveValue('3');
  await expect(cfpPage.codeOfConductUrlInput).toHaveValue('https://example.com');
});

test('updates meetup CFP settings', async ({ page }) => {
  const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['meetup-cfp-close'] });

  const cfpPage = new CfpSettingsPage(page);
  await cfpPage.goto(team.slug, event.slug);

  // Update CFP settings
  await cfpPage.cfpActivationSwitch.click();
  await expect(cfpPage.toast).toHaveText('Call for papers updated.');

  // Check if the values are saved
  await cfpPage.goto(team.slug, event.slug);
  await expect(cfpPage.cfpActivationSwitch).toBeChecked();
});
