describe('Organizations page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organization');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('redirects to signin, when user is not connected', () => {
    cy.visit('organizer');
    cy.assertText('Log in to Conference Hall');
  });

  it('display empty state when user has no organization', () => {
    cy.login();
    cy.visit('organizer');
    cy.assertText("You don't have any organizations.");
  });
});
