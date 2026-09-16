import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { scheduleSessionFactory } from 'tests/factories/schedule-session.ts';
import { scheduleTrackFactory } from 'tests/factories/schedule-track.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { SchedulePage } from './schedule.page.ts';

test('displays event schedule', async ({ page, context }) => {
  const user = await userLoggedFactory(context);
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

  // Create a session on the main stage
  await schedulePage.submitNewSession('Opening keynote');
  await expect(schedulePage.session('Opening keynote')).toBeVisible();
  await expect(schedulePage.sessionBlock('Opening keynote')).toContainText('09:00');

  // A session placed on the same track and time slot is refused
  await schedulePage.submitNewSession('Second keynote');
  await expect(schedulePage.sessionConflictError).toBeVisible();
  await schedulePage.clickOnCancelSession();

  // Go to the next day
  await schedulePage.clickOnNextDay();
  await expect(page.getByRole('button', { name: 'January 2, 2022' })).toBeVisible();

  // Open the settings
  await schedulePage.clickOnOptions();
  await schedulePage.clickOnManageTracksMenu();
  await expect(page.getByRole('heading', { name: 'Schedule tracks configuration' })).toBeVisible();

  // TODO: Add more tests on the settings
});

test('autofills the vacant sessions of the schedule', async ({ page, context }) => {
  const user = await userLoggedFactory(context);
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  const schedule = await scheduleFactory({ event });
  const track = await scheduleTrackFactory({ name: 'Main stage', schedule });

  const speaker = await userFactory();
  const talk = await talkFactory({ speakers: [speaker], attributes: { title: 'Autofilled talk' } });
  await proposalFactory({ event, talk, traits: ['accepted'] });

  await scheduleSessionFactory({
    schedule,
    track,
    start: new Date('2024-10-05T09:00:00.000Z'),
    end: new Date('2024-10-05T10:00:00.000Z'),
  });

  const schedulePage = new SchedulePage(page);
  await schedulePage.gotoDay(team.slug, event.slug, '0');

  await schedulePage.clickOnOptions();
  await schedulePage.clickOnAutofillMenu();
  await expect(schedulePage.autofillPanel.getByText('1 session will be filled')).toBeVisible();

  await schedulePage.clickOnFillSessions();

  await expect(schedulePage.autofillPanel.getByText('Autofill result')).toBeVisible();
  await expect(schedulePage.autofillPanel.getByText('1 session filled')).toBeVisible();
  await expect(schedulePage.session('Autofilled talk')).toBeVisible();
});

test.describe('as a team reviewer', () => {
  test('does not have access to publication', async ({ page, context }) => {
    const user = await userLoggedFactory(context);
    const team = await teamFactory({ reviewers: [user] });
    const event = await eventFactory({ team });

    await page.goto(`/team/${team.slug}/${event.slug}/schedule`);

    const schedulePage = new SchedulePage(page);
    await expect(schedulePage.forbiddenPage).toBeVisible();
  });
});
