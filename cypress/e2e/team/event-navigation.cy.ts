import EventNavBarPage from 'page-objects/team/event-nav-bar.page.ts';

describe('Event navigation page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-navigation');
  });

  const page = new EventNavBarPage();

  describe('for a conference', () => {
    it('team owners can access to all features', () => {
      cy.login('Clark Kent');
      page.visit('team-1', 'conference-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('exist');
      page.scheduleTab().should('exist');
      page.settingsTab().should('exist');
    });

    it('team members can access to all features', () => {
      cy.login('Bruce Wayne');
      page.visit('team-1', 'conference-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('exist');
      page.scheduleTab().should('exist');
      page.settingsTab().should('exist');
    });

    it('team reviewers can access to limited set of features', () => {
      cy.login('Peter Parker');
      page.visit('team-1', 'conference-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('not.exist');
      page.scheduleTab().should('not.exist');
      page.settingsTab().should('not.exist');
    });
  });

  describe('for a meetup', () => {
    it('team owners can access to all features', () => {
      cy.login('Clark Kent');
      page.visit('team-1', 'meetup-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('not.exist');
      page.scheduleTab().should('not.exist');
      page.settingsTab().should('exist');
    });

    it('team members can access to all features', () => {
      cy.login('Bruce Wayne');
      page.visit('team-1', 'meetup-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('not.exist');
      page.scheduleTab().should('not.exist');
      page.settingsTab().should('exist');
    });

    it('team reviewers can access to limited set of features', () => {
      cy.login('Peter Parker');
      page.visit('team-1', 'meetup-1');
      page.overviewTab().should('exist');
      page.proposalsTab().should('exist');
      page.publicationTab().should('not.exist');
      page.scheduleTab().should('not.exist');
      page.settingsTab().should('not.exist');
    });
  });
});
