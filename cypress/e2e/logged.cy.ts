describe('Logged on event page', () => {
  beforeEach(() => cy.task('seedDB', 'logged'));
  afterEach(() => cy.task('resetDB'));

  it('displays incoming events by default', () => {
    cy.logUser();
    cy.visit('/speaker/talks');
    cy.assertText('Your talks');
  });
});
