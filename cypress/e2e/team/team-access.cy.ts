import LoginPage from 'page-objects/login.page';

describe('Team page access and redirections', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();

  it('redirects to signin, when user is not connected', () => {
    cy.visitAndCheck('team');
    login.isPageVisible();
  });

  it('redirects to new team page when user has no team', () => {
    cy.login('Peter Parker');
    cy.visitAndCheck('team');
    cy.assertText('Create a new team');
  });

  it('redirects to request page when user has no access', () => {
    cy.login('Bruce Wayne');
    cy.visitAndCheck('team');
    cy.assertText('Become event organizer');
  });

  it('redirects to request page when user has no access', () => {
    cy.login('Bruce Wayne');
    cy.visitAndCheck('team');
    cy.assertText('Become event organizer');
  });
});
