describe('Organizer page access', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizer-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('redirects to signin, when user is not connected', () => {
    cy.visit('organizer');
    cy.assertText('Log in to Conference Hall');
  });

  it('redirects to welcome page when user has no organization', () => {
    cy.login('Peter Parker');
    cy.visit('organizer');
    cy.assertText("You don't have any organizations.");
  });

  it('redirects to request page when user has no access', () => {
    cy.login('Bruce Wayne');
    cy.visit('organizer');
    cy.assertText('Request access');
  });
});
