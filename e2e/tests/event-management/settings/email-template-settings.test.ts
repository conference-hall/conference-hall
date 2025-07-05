import type { Event, Team, User } from '@prisma/client';
import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { EmailTemplateSettingsPage } from './email-template-settings.page.ts';
import { EmailsSettingsPage } from './emails-settings.page.ts';

loginWith('clark-kent');

test.describe('Email Template Settings', () => {
  let user: User;
  let team: Team;
  let event: Event;

  test.beforeEach(async () => {
    await flags.set('emailCustomization', true);
    user = await userFactory({ traits: ['clark-kent'] });
    team = await teamFactory({ owners: [user] });
    event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  });

  test('displays email template customization page', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');

    await expect(templatePage.getTemplateHeading('speakers-proposal-submitted')).toBeVisible();
    await expect(templatePage.editButton).toBeVisible();
    await expect(templatePage.backButton).toBeVisible();
  });

  test('navigates back to emails list', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');
    await templatePage.clickBackButton();

    const emailsPage = new EmailsSettingsPage(page);
    await expect(emailsPage.heading).toBeVisible();
  });

  test('opens edit template modal', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');
    await templatePage.clickEditButton();

    await expect(templatePage.subjectInput).toBeVisible();
    await expect(templatePage.contentTextarea).toBeVisible();
    await expect(templatePage.saveButton).toBeVisible();
  });

  test('customizes email template', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');
    await templatePage.clickEditButton();
    await templatePage.fillSubject('Custom Subject for Test');
    await templatePage.fillContent('Custom email content for testing purposes.');
    await templatePage.saveChanges();

    await expect(templatePage.toast).toBeVisible();
    await expect(templatePage.editModal).not.toBeVisible();
  });

  test('cancels edit template modal', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');
    await templatePage.clickEditButton();
    await templatePage.fillSubject('Test Subject');

    await expect(templatePage.editModal).not.toBeVisible();
  });

  test('resets email template to default', async ({ page }) => {
    const templatePage = new EmailTemplateSettingsPage(page);
    await templatePage.goto(team.slug, event.slug, 'speakers-proposal-submitted', 'en');
    await templatePage.clickEditButton();
    await templatePage.fillSubject('Custom Subject');
    await templatePage.saveChanges();
    await expect(templatePage.toast).toBeVisible();

    await templatePage.clickResetButton();
    await expect(templatePage.toast).toBeVisible();
  });
});
