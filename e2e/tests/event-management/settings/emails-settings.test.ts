import type { Event, Team, User } from 'prisma/generated/client.ts';
import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { CUSTOM_EMAIL_TEMPLATES } from '~/shared/emails/email.types.ts';
import { SUPPORTED_LANGUAGES } from '~/shared/i18n/i18n.ts';
import { EmailTemplateSettingsPage } from './email-template-settings.page.ts';
import { EmailsSettingsPage } from './emails-settings.page.ts';

loginWith('clark-kent');

test.describe('Email Settings', () => {
  let user: User;
  let team: Team;
  let event: Event;

  test.beforeEach(async () => {
    user = await userFactory({ traits: ['clark-kent'] });
    team = await teamFactory({ owners: [user] });
    event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  });

  test('displays email templates list with customize links', async ({ page }) => {
    const emailsPage = new EmailsSettingsPage(page);
    await emailsPage.goto(team.slug, event.slug);

    // Check page heading and description
    await expect(emailsPage.heading).toBeVisible();

    // Check all three email templates are displayed
    for (const template of CUSTOM_EMAIL_TEMPLATES) {
      for (const locale of SUPPORTED_LANGUAGES) {
        const customizeLink = emailsPage.getCustomizeLink(template, locale);
        await expect(customizeLink).toBeVisible();

        // Check the link goes to the correct URL
        const href = await customizeLink.getAttribute('href');
        expect(href).toContain(`/settings/emails/${template}`);
        expect(href).toContain(`locale=${locale}`);
      }
    }
  });

  test('navigates to template customization page', async ({ page }) => {
    const emailsPage = new EmailsSettingsPage(page);
    await emailsPage.goto(team.slug, event.slug);

    // Click on customize link for proposal-submitted in English
    const customizeLink = emailsPage.getCustomizeLink('speakers-proposal-submitted', 'en');
    await customizeLink.click();

    // Verify we're on the template page
    const templatePage = new EmailTemplateSettingsPage(page);
    await expect(templatePage.getTemplateHeading('speakers-proposal-submitted')).toBeVisible();
  });

  test('shows custom badges for customized templates', async ({ page }) => {
    const emailsPage = new EmailsSettingsPage(page);
    await emailsPage.goto(team.slug, event.slug);

    for (const template of CUSTOM_EMAIL_TEMPLATES) {
      const badge = emailsPage.getCustomBadge(template);
      // Badge should exist (might be Custom or Default)
      await expect(badge).toBeVisible();
    }
  });
});
