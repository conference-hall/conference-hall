describe('Organizer page access and redirections', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizer-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('redirects to signin, when user is not connected', () => {
    cy.visit('organizer');
    cy.assertText('Sign in to your account');
  });

  it('redirects to new organization page when user has no organization', () => {
    cy.login('Peter Parker');
    cy.visit('organizer');
    cy.assertText('Create a new organization');
  });

  it('redirects to request page when user has no access', () => {
    cy.login('Bruce Wayne');
    cy.visit('organizer');
    cy.assertText('Limited access');
  });

  it('redirects to request page when user has no access', () => {
    cy.login('Bruce Wayne');
    cy.visit('organizer');
    cy.assertText('Limited access');
  });
});
