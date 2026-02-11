import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { SchedulePage } from './schedule.page.ts';

loginWith('clark-kent');

test('displays event schedule', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: {
      timezone: 'Europe/Paris',
      conferenceStart: new Date('2022-01-01'),
      conferenceEnd: new Date('2022-01-02'),
    },
  });

  const schedulePage = new SchedulePage(page);
  await schedulePage.goto(team.slug, event.slug);

  // Create a new schedule
  await expect(schedulePage.nameInput).toHaveValue(`${event.name} schedule`);
  await expect(schedulePage.timezoneInput).toContainText('Europe/Paris');
  await expect(schedulePage.startDateInput).toHaveValue('2022-01-01');
  await expect(schedulePage.endDateInput).toHaveValue('2022-01-02');
  await schedulePage.clickOnNewSchedule();

  // Check the schedule page
  await expect(page.getByRole('heading', { name: `${event.name} schedule` })).toBeVisible();
  await expect(page.getByRole('button', { name: 'January 1, 2022' })).toBeVisible();
  await expect(page.getByText('09:00 to 18:00')).toBeVisible();
  await expect(page.getByText('Main stage')).toBeVisible();

  // Go to the next day
  await schedulePage.clickOnNextDay();
  await expect(page.getByRole('button', { name: 'January 2, 2022' })).toBeVisible();

  // Open the settings
  await schedulePage.clickOnOptions();
  await schedulePage.clickOnManageTracksMenu();
  await expect(page.getByRole('heading', { name: 'Schedule tracks configuration' })).toBeVisible();

  // TODO: Add more tests on the settings
});

test.describe('as a team reviewer', () => {
  loginWith('bruce-wayne');

  test('does not have access to publication', async ({ page }) => {
    const user = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ reviewers: [user] });
    const event = await eventFactory({ team });

    await page.goto(`/team/${team.slug}/${event.slug}/schedule`);

    const schedulePage = new SchedulePage(page);
    await expect(schedulePage.forbiddenPage).toBeVisible();
  });
});
