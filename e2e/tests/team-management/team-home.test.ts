import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { NewEventPage } from './new-event.page.ts';
import { TeamHomePage } from './team-home.page.ts';

useLoginSession();

test.describe('As a team owner', () => {
  test('displays event list', async ({ page }) => {
    const owner = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ owners: [owner] });
    const team2 = await teamFactory({ owners: [owner] });
    const event1 = await eventFactory({ team, traits: ['conference-cfp-open'] });
    const event2 = await eventFactory({ team, traits: ['meetup-cfp-open'] });
    const event3 = await eventFactory({ team, traits: ['conference-cfp-past', 'archived'] });

    const teamHomePage = new TeamHomePage(page);
    await teamHomePage.goto(team.slug);

    // Check navigation
    await expect(teamHomePage.eventsTab).toBeVisible();
    await expect(teamHomePage.settingsTab).toBeVisible();

    // Default events list
    await expect(teamHomePage.events).toHaveCount(2);
    await expect(teamHomePage.event(event1.name)).toBeVisible();
    await expect(teamHomePage.event(event2.name)).toBeVisible();

    // Archived events list
    await teamHomePage.clickOnArchived();
    await expect(teamHomePage.events).toHaveCount(1);
    await expect(teamHomePage.event(event3.name)).toBeVisible();

    // When no events
    await teamHomePage.goto(team2.slug);
    await expect(page.getByText(`Welcome to "${team2.name}"`)).toBeVisible();
  });

  test('can create a new conference', async ({ page }) => {
    const owner = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ owners: [owner] });

    const teamHomePage = new TeamHomePage(page);
    await teamHomePage.goto(team.slug);
    const newEventPage = await teamHomePage.clickOnNewEvent();
    await newEventPage.waitFor();

    // Create a new conference
    await newEventPage.clickOnConference();
    await newEventPage.clickOnContinueToGeneralForm();
    await newEventPage.conferenceForm.waitFor();

    // Fill the event form
    await newEventPage.fillEventForm('Hello world', 'hello-world');
    await newEventPage.clickOnContinueToDetailsForm();
    await newEventPage.detailsForm('Hello world').waitFor();

    // Fill the details form
    await newEventPage.fillConferenceDetails('2022-12-12', '2022-12-13', 'Nantes, France', 'Hello world!');
    await newEventPage.clickOnContinueToCfpForm();
    await newEventPage.cfpForm('Hello world').waitFor();

    // Fill the CFP form
    await newEventPage.fillConferenceOpenings('2022-12-12', '2022-12-13');
    const eventPage = await newEventPage.clickOnFinish();

    // Check the event page
    await eventPage.waitFor();
  });

  test('can create a new meetup', async ({ page }) => {
    const owner = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ owners: [owner] });

    const teamHomePage = new TeamHomePage(page);
    await teamHomePage.goto(team.slug);
    const newEventPage = await teamHomePage.clickOnNewEvent();
    await newEventPage.waitFor();

    // Create a new conference
    await newEventPage.clickOnMeetup();
    await newEventPage.clickOnContinueToGeneralForm();
    await newEventPage.meetupForm.waitFor();

    // Fill the event form
    await newEventPage.fillEventForm('Hello world', 'hello-world');
    await newEventPage.clickOnContinueToDetailsForm();
    await newEventPage.detailsForm('Hello world').waitFor();

    // Fill the details form
    await newEventPage.fillMeetupDetails('Nantes, France', 'Hello world!');
    const eventPage = await newEventPage.clickOnFinish();

    // Check the event page
    await eventPage.waitFor();
  });

  test('cannot create an event with an existing slug', async ({ page }) => {
    const owner = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ owners: [owner] });
    await eventFactory({ team, attributes: { slug: 'event-1' } });

    const newEventPage = new NewEventPage(page);
    await newEventPage.goto(team.slug);

    // Create a new conference
    await newEventPage.clickOnConference();
    await newEventPage.clickOnContinueToGeneralForm();
    await newEventPage.conferenceForm.waitFor();

    // Fill the event form
    await newEventPage.fillEventForm('Hello world', 'event-1');
    await newEventPage.clickOnContinueToDetailsForm();

    // Check the error message
    await expect(page.getByText('This URL already exists.')).toBeVisible();
  });
});

test.describe('As a team member', () => {
  test('displays correct tabs and actions', async ({ page }) => {
    const member = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ members: [member] });

    const teamHomePage = new TeamHomePage(page);
    await teamHomePage.goto(team.slug);

    // Check navigation
    await expect(teamHomePage.eventsTab).toBeVisible();
    await expect(teamHomePage.settingsTab).toBeVisible();

    // Check action
    await expect(teamHomePage.newEventButton).not.toBeVisible();
  });
});

test.describe('As a team reviewer', () => {
  test('displays correct tabs and actions', async ({ page }) => {
    const reviewer = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ reviewers: [reviewer] });

    const teamHomePage = new TeamHomePage(page);
    await teamHomePage.goto(team.slug);

    // Check navigation
    await expect(teamHomePage.eventsTab).toBeVisible();
    await expect(teamHomePage.settingsTab).toBeVisible();

    // Check action
    await expect(teamHomePage.newEventButton).not.toBeVisible();
  });
});
