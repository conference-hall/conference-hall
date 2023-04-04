import OrganizerEventNewPage from 'page-objects/organizer/event-new.page';
import OrganizationEventsPage from 'page-objects/organizer/events-list.page';

describe('Organization event list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/events-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organization = new OrganizationEventsPage();
  const eventNew = new OrganizerEventNewPage();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays events list and can create a new event', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.membersTab().should('exist');
      organization.settingsTab().should('exist');

      organization.list().should('have.length', 2);
      organization.newEvent();
      eventNew.isPageVisible();
    });

    it('displayed empty state when no event and can create a new one', () => {
      organization.visit('awesome-orga-2');
      cy.assertText('Welcome to "Awesome orga 2"');
      cy.findByRole('link', { name: 'New event' }).should('exist');
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('displays limited tabs', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.membersTab().should('exist');
      organization.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('displays limited tabs', () => {
      organization.visit('awesome-orga');
      organization.eventsTab().should('exist');
      organization.membersTab().should('not.exist');
      organization.settingsTab().should('not.exist');
      cy.findByRole('button', { name: 'New event' }).should('not.exist');
    });
  });
});
