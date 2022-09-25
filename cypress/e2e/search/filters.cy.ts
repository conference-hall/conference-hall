import SearchEventPage from 'page-objects/search.page';

describe('Use filters searching events.', () => {
  beforeEach(() => cy.task('seedDB', 'search/filters'));
  afterEach(() => cy.task('disconnectDB'));

  const search = new SearchEventPage();

  it('filters on "Past CFP" and "Conferences & Meetups"', () => {
    search.visit();
    search.filterByCfpStatus('Past CFP').click();
    search.filterByEventTypes('Conferences & Meetups').click();

    search.results().should('have.length', 1);
    search.result('Conference CFP past').should('exist');
    cy.url().should('contain', '/?cfp=past&type=all');
  });

  it('filters on "Incoming CFP" and "Conferences only"', () => {
    search.visit();
    search.filterByCfpStatus('Incoming CFP').click();
    search.filterByEventTypes('Conferences only').click();

    search.results().should('have.length', 2);
    search.result('Conference CFP open').should('exist');
    search.result('Conference CFP future').should('exist');
    cy.url().should('contain', '/?cfp=incoming&type=conference');
  });

  it('filters on "Incoming CFP" and "Meetups only"', () => {
    search.visit();
    search.filterByCfpStatus('Incoming CFP').click();
    search.filterByEventTypes('Meetups only').click();

    search.results().should('have.length', 1);
    search.result('Meetup CFP open').should('exist');
    cy.url().should('contain', '/?cfp=incoming&type=meetup');
  });

  it('applies filters with query parameters in url', () => {
    search.visit('?cfp=past&type=conference');

    search.results().should('have.length', 1);
    search.result('Conference CFP past').should('exist');
    cy.findByText('Past CFP').should('be.visible');
    cy.findByText('Conferences only').should('be.visible');
  });
});
