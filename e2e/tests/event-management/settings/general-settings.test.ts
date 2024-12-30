import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { GeneralSettingsPage } from './general-settings.page.ts';

loginWith('clark-kent');

test('updates event settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const generalPage = new GeneralSettingsPage(page);

  // General settings
  await generalPage.goto(team.slug, event.slug);
  await generalPage.fill(generalPage.nameInput, 'New name');
  await generalPage.fill(generalPage.slugInput, 'new-slug');
  await generalPage.privateRadio.click();
  await generalPage.saveGeneralButton.click();
  await expect(generalPage.toast).toHaveText('Event saved.');

  // Details settings
  await generalPage.goto(team.slug, 'new-slug');
  await generalPage.fill(generalPage.startDateInput, '01/01/2022');
  await generalPage.fill(generalPage.endDateInput, '02/01/2022');
  await generalPage.fill(generalPage.locationInput, 'New location');
  await generalPage.fill(generalPage.descriptionInput, 'New description');
  await generalPage.fill(generalPage.websiteUrlInput, 'https://new-website.com');
  await generalPage.fill(generalPage.contactEmailInput, 'test@email.com');
  await generalPage.saveDetailsButton.click();
  await expect(generalPage.toast).toHaveText('Event details saved.');

  // Check values
  await generalPage.goto(team.slug, 'new-slug');
  await expect(generalPage.nameInput).toHaveValue('New name');
  await expect(generalPage.slugInput).toHaveValue('new-slug');
  await expect(generalPage.privateRadio).toBeChecked();
  await expect(generalPage.startDateInput).toHaveValue('2022-01-01');
  await expect(generalPage.endDateInput).toHaveValue('2022-01-02');
  await expect(generalPage.locationInput).toHaveValue('New location');
  await expect(generalPage.descriptionInput).toHaveValue('New description');
  await expect(generalPage.websiteUrlInput).toHaveValue('https://new-website.com');
  await expect(generalPage.contactEmailInput).toHaveValue('test@email.com');

  // Location switch
  await generalPage.switchOnlineEvent().click();
  await generalPage.saveDetailsButton.click();
  await expect(generalPage.toast).toHaveText('Event details saved.');

  // Check values
  await generalPage.goto(team.slug, 'new-slug');
  await expect(generalPage.switchOnlineEvent()).toBeChecked();
  await expect(generalPage.locationInput).not.toBeVisible();

  // Archive and restore
  await generalPage.archiveButton.click();
  await expect(generalPage.toast).toHaveText('Event archived.');
  await generalPage.restoreButton.click();
  await expect(generalPage.toast).toHaveText('Event restored.');
});
