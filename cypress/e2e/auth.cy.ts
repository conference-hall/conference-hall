describe('Authentication', () => {
  afterEach(() => cy.task('resetDB'));

  it('login', () => {
    cy.visit('/login');
    cy.clickOn('Continue with Google');
    cy.url().should('contain', '/emulator');
    cy.findByText('Clark Kent').click();
    cy.url().should('equal', 'http://localhost:3001/');
    cy.clickOn('Open user menu');
    cy.assertText('Signed in as');
    cy.assertText('superman@example.com');
  });

  it('login and redirect to the path', () => {
    cy.visit('/login?redirectTo=/speaker/talks');
    cy.clickOn('Continue with Google');
    cy.url().should('contain', '/emulator');
    cy.findByText('Clark Kent').click();
    cy.url().should('contains', '/speaker/talks');
  });
});
