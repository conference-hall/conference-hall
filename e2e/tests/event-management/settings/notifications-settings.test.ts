import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../../fixtures.ts';
import { NotificationsSettingsPage } from './notifications-settings.page.ts';

loginWith('clark-kent');

test('updates notifications settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const notificationsPage = new NotificationsSettingsPage(page);
  await notificationsPage.goto(team.slug, event.slug);

  // Default values
  await expect(notificationsPage.submittedProposalSwitch).not.toBeChecked();
  await expect(notificationsPage.confirmedProposalSwitch).not.toBeChecked();
  await expect(notificationsPage.declinedProposalSwitch).not.toBeChecked();

  // Update notifications with errors
  await notificationsPage.fill(notificationsPage.emailInput, 'blablabla');
  await notificationsPage.saveButton.click();
  const emailError = await notificationsPage.getInputDescription(notificationsPage.emailInput);
  await expect(emailError).toHaveText('Invalid email address');

  // Update notification email
  await notificationsPage.fill(notificationsPage.emailInput, 'test@email.com');
  await notificationsPage.saveButton.click();
  await expect(notificationsPage.toast).toHaveText('Notification email saved.');

  // Enable submitted proposal notification
  await notificationsPage.submittedProposalSwitch.click();
  await expect(notificationsPage.toast).toHaveText('Notification setting saved.');
  await notificationsPage.goto(team.slug, event.slug);
  await expect(notificationsPage.submittedProposalSwitch).toBeChecked();

  // Enable confirmed proposal notification
  await notificationsPage.confirmedProposalSwitch.click();
  await expect(notificationsPage.toast).toHaveText('Notification setting saved.');
  await notificationsPage.goto(team.slug, event.slug);
  await expect(notificationsPage.confirmedProposalSwitch).toBeChecked();

  // Enable declined proposal notification
  await notificationsPage.declinedProposalSwitch.click();
  await expect(notificationsPage.toast).toHaveText('Notification setting saved.');
  await notificationsPage.goto(team.slug, event.slug);
  await expect(notificationsPage.declinedProposalSwitch).toBeChecked();
});
