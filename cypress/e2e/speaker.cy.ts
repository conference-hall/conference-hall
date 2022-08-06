describe('Logged on event page', () => {
  beforeEach(() => cy.task('seedDB', 'speaker'));
  afterEach(() => cy.task('resetDB'));

  it('displays the speaker talks', () => {
    cy.login();
    cy.visit('/speaker/talks');
    cy.assertText('Your talks');
  });

  it('displays the speaker talks 2', () => {
    cy.login();
    cy.visit('/speaker/talks');
    cy.assertText('Your talks');
  });
});
