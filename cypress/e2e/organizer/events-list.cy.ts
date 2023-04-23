import OrganizerEventSettingsPage from 'page-objects/organizer/event-settings/event-settings.page';
import OrganizationEventsPage from 'page-objects/organizer/events-list.page';

describe('Organization event list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/events-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organization = new OrganizationEventsPage();
  const eventSettings = new OrganizerEventSettingsPage();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays events list', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.settingsTab().should('exist');

      organization.list().should('have.length', 2);
    });

    it('displays archived events list', () => {
      organization.visit('awesome-orga');
      organization.archivedEvents();
      organization.list().should('have.length', 1);
      organization.event('Awesome event archived');
    });

    it('displayed empty state when no event', () => {
      organization.visit('awesome-orga-2');
      cy.assertText('Welcome to "Awesome orga 2"');
    });

    it('can create a new conference', () => {
      organization.visit('awesome-orga');
      organization.newEvent();
      organization.selectConference();
      organization.fillNewEventForm({ name: 'Hello world' });
      organization.createEvent();
      eventSettings.isPageVisible();
      cy.assertInputText('Name', 'Hello world');
      cy.assertInputText('Event URL', 'hello-world');
    });

    it('can create a new meetup', () => {
      organization.visit('awesome-orga');
      organization.newEvent();
      organization.selectMeetup();
      organization.fillNewEventForm({ name: 'Hello world' });
      organization.createEvent();
      eventSettings.isPageVisible();
      cy.assertInputText('Name', 'Hello world');
      cy.assertInputText('Event URL', 'hello-world');
    });

    it('cannot create an event with an existing slug', () => {
      organization.visit('awesome-orga');
      organization.newEvent();
      organization.selectConference();
      organization.fillNewEventForm({ name: 'Hello world', slug: 'event-1' });
      organization.createEvent();
      organization.error('Event URL').should('contain.text', 'Slug already exists, please try another one.');
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('displays limited tabs and actions', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('displays limited tabs and actions', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });
});
