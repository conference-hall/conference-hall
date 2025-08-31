import { loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { NavigationSettingsPage } from './navigation-settings.page.ts';

loginWith('clark-kent');

test('can access to the settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const settingsPage = new NavigationSettingsPage(page);
  await settingsPage.goto(team.slug, event.slug);

  const generalPage = await settingsPage.clickOnSetting('General');
  await generalPage.waitFor();

  const cfpPage = await settingsPage.clickOnSetting('Call for papers');
  await cfpPage.waitFor();

  const tracksPage = await settingsPage.clickOnSetting('Tracks');
  await tracksPage.waitFor();

  const tagsPage = await settingsPage.clickOnSetting('Proposal tags');
  await tagsPage.waitFor();

  const customizePage = await settingsPage.clickOnSetting('Customize');
  await customizePage.waitFor();

  const surveyPage = await settingsPage.clickOnSetting('Speaker survey');
  await surveyPage.waitFor();

  const reviewsPage = await settingsPage.clickOnSetting('Reviews');
  await reviewsPage.waitFor();

  const notificationsPage = await settingsPage.clickOnSetting('Email notifications');
  await notificationsPage.waitFor();

  const integrationsPage = await settingsPage.clickOnSetting('Integrations');
  await integrationsPage.waitFor();

  const webApiPage = await settingsPage.clickOnSetting('Web API');
  await webApiPage.waitFor();
});

test.describe('As a member', () => {
  test('can access to the settings', async ({ page }) => {
    const user = await userFactory({ traits: ['clark-kent'] });
    const team = await teamFactory({ members: [user] });
    const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

    const settingsPage = new NavigationSettingsPage(page);
    await settingsPage.goto(team.slug, event.slug);
  });
});

test.describe('As a reviewer', () => {
  test('cannot access to the settings', async ({ page }) => {
    const user = await userFactory({ traits: ['clark-kent'] });
    const team = await teamFactory({ reviewers: [user] });
    const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

    await page.goto(`/team/${team}/${event}/settings`);

    const settingsPage = new NavigationSettingsPage(page);
    await settingsPage.forbiddenPage.waitFor();
  });
});
