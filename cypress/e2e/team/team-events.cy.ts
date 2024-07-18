import TeamHomePage from 'page-objects/team/team-home.page.ts';

import OrganizerEventSettingsPage from '../../page-objects/team/event-settings/event-settings.page.ts';

describe("Team's events list", () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-events');
  });

  afterEach(() => cy.task('disconnectDB'));

  const team = new TeamHomePage();
  const eventSettings = new OrganizerEventSettingsPage();

  describe('as a team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays events list', () => {
      team.visit('awesome-team');
      team.eventsTab().should('exist');
      team.settingsTab().should('exist');

      team.list().should('have.length', 2);
    });

    it('displays archived events list', () => {
      team.visit('awesome-team');
      team.archivedEvents();
      team.list().should('have.length', 1);
      team.event('Awesome event archived');
    });

    it('displayed empty state when no event', () => {
      team.visit('awesome-team-2');
      cy.assertText('Welcome to "Awesome team 2"');
    });

    it('can create a new conference', () => {
      team.visit('awesome-team');
      const newEventPage = team.newEvent();

      newEventPage.selectConference();
      newEventPage.continueToGeneralForm();

      newEventPage.isConferenceFormVisible();
      newEventPage.fillNewEventForm({ name: 'Hello world' });
      newEventPage.continueToDetailsForm();

      newEventPage.isDetailsFormVisible('Hello world');
      newEventPage.continueToCfpForm();

      newEventPage.isCfpFormVisible('Hello world');
      newEventPage.finish();

      eventSettings.visit('awesome-team', 'hello-world');
      cy.assertInputText('Name', 'Hello world');
      cy.assertInputText('Event URL', 'hello-world');
    });

    it('can create a new meetup', () => {
      team.visit('awesome-team');
      const newEventPage = team.newEvent();

      newEventPage.selectMeetup();
      newEventPage.continueToGeneralForm();

      newEventPage.isMeetupFormVisible();
      newEventPage.fillNewEventForm({ name: 'Hello world' });
      newEventPage.continueToDetailsForm();

      newEventPage.isDetailsFormVisible('Hello world');
      newEventPage.finish();

      eventSettings.visit('awesome-team', 'hello-world');
      cy.assertInputText('Name', 'Hello world');
      cy.assertInputText('Event URL', 'hello-world');
    });

    it('cannot create an event with an existing slug', () => {
      team.visit('awesome-team');
      const newEventPage = team.newEvent();

      newEventPage.selectConference();
      newEventPage.continueToGeneralForm();

      newEventPage.isConferenceFormVisible();
      newEventPage.fillNewEventForm({ name: 'Hello world', slug: 'event-1' });
      newEventPage.continueToDetailsForm();

      newEventPage.inputError('Event URL').should('contain.text', 'This URL already exists, please try another one.');
    });
  });

  describe('as a team member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('displays limited tabs and actions', () => {
      team.visit('awesome-team');
      team.eventsTab().should('exist');
      team.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('displays limited tabs and actions', () => {
      team.visit('awesome-team');
      team.eventsTab().should('exist');
      team.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });
});
