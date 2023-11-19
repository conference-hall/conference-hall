describe('Team page access and redirections', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('displays request access page', () => {
    cy.login('Bruce Wayne');
    cy.visit('team/request');
    cy.assertText('Become event organizer');
  });
});
