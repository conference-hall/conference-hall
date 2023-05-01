import LoginPage from 'page-objects/login.page';

describe('Organizer page access and redirections', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizer-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visit('organizer');
    login.isPageVisible();
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
