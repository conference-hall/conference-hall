describe('Organizations page list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizations-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('displays organization list when user has severals organizations', () => {
    cy.login();
    cy.visit('organizer');
    cy.assertText('My organizations');
  });
});
