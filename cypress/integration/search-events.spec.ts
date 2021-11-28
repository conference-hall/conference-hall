describe('Search events', () => {
  beforeEach(() => {
    cy.task('db:reset').task('db:seed', 'search-events');
  });

  it('search events from the home page', () => {
    cy.visit('/');
    cy.clickButton('Search');
  });

  it('search events from the search page', () => {
    cy.visit('/search');
    cy.findByPlaceholderText('search').type('Devfest');
    cy.clickButton('Search');
  });
});
