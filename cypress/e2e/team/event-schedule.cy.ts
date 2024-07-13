import ScheduleNewPage from 'page-objects/team/event-schedule-new.page.ts';

describe('Schedule page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-schedule');
  });

  afterEach(() => cy.task('disconnectDB'));

  const page = new ScheduleNewPage();

  it.only('manages a schedule', () => {
    cy.login('Clark Kent');
    page.visit('team-1', 'conference-1');

    cy.assertInputText('Name', 'Conference 1 schedule');
    cy.assertInputText('Start date', '2022-01-01');
    cy.assertInputText('End date', '2022-01-02');

    const schedule = page.create();
    schedule.isPageVisible('Conference 1 schedule');

    cy.findByRole('heading', { name: 'Saturday, January 1st, 2022' }).should('exist');
    cy.assertText('09:00 to 18:00');
    cy.assertText('GMT+2');
    cy.assertText('Main stage');
  });

  describe('as a team reviewer', () => {
    it('does not have access to schedule', () => {
      cy.login('Bruce Wayne');
      cy.visitAndCheck(`/team/team-1/conference-1/schedule`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
