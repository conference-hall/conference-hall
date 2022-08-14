import LoginPage from '../page-objects/login.page';

describe('Authentication', () => {
  afterEach(() => cy.task('disconnectDB'));

  const login = new LoginPage();

  it('login', () => {
    login.visit();
    login.signinWithGoogle('Clark Kent');

    cy.url().should('equal', 'http://localhost:3001/');
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    cy.assertText('superman@example.com');
  });

  it('login and redirected', () => {
    login.visit('/speaker/talks');
    login.signinWithGoogle('Clark Kent');

    cy.url().should('contains', '/speaker/talks');
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    cy.assertText('superman@example.com');
  });
});
