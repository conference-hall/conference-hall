import SearchEventPage from '../../page-objects/search.page.ts';

describe('Use filters searching events.', () => {
  beforeEach(() => cy.task('seedDB', 'search/filters'));
  afterEach(() => cy.task('disconnectDB'));

  const search = new SearchEventPage();

  it('filters by conference types', () => {
    search.visit();
    search.results().should('have.length', 3);

    search.filterByConferences();
    search.results().should('have.length', 2);

    search.filterByMeetups();
    search.results().should('have.length', 1);

    search.filterByAllTypes();
    search.results().should('have.length', 3);
  });
});
