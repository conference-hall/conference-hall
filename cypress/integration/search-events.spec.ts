describe('Search events', () => {
  beforeEach(() => {
    cy.task('db:reset').task('db:seed', 'search-events');
  });

  describe('From home page', () => {
    it('redirect to search page and search events', () => {
      cy.visit('/');
      cy.typeOn('Search events', 'Devfest');
      cy.clickOn('Search');
      cy.assertUrl('/search?terms=Devfest');
      cy.assertText('Devfest Nantes');
    });
  });

  describe('From search page', () => {
    it('displays incoming events by default', () => {
      cy.visit('/search');
      cy.assertText('Devfest Nantes');
      cy.assertText('Devoxx France');
    });
  
    it('search events', () => {
      cy.visit('/search');
      cy.typeOn('Search events', 'Devfest');
      cy.clickOn('Search');
      cy.assertText('Devfest Nantes');
    });

    it('displays no result page if no events found', () => {
      cy.visit('/search');
      cy.typeOn('Search events', 'nothing');
      cy.clickOn('Search');
      cy.assertText('No events found.');
    });
  });
});
