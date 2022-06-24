describe('View event page', () => {
  beforeEach(() => {
    cy.task('resetDB').task('seedDB', 'view-event');
  });

  afterEach(() => cy.task('disconnectDB'));

  it('displays incoming events by default', () => {
    cy.visit('/devfest-nantes');
    cy.assertText('Devfest Nantes');
    cy.assertText('Nantes, France');
    cy.assertText('1 day conference - October 5th, 2020');
    cy.assertText('Call for paper is closed');
    cy.assertText('Since Tuesday, October 6th, 2020');
    cy.assertText('The event !');
  });
});
