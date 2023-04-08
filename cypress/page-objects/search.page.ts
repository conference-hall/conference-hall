import BasePage from './base.page';

class SearchEventPage extends BasePage {
  visit(searchParams?: string) {
    cy.visit(`/${searchParams || ''}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByText('Call for papers for conferences and meetups.').should('exist');
    cy.findByRole('searchbox', { name: 'Search conferences and meetups.' }).should('exist');
  }

  search(text: string) {
    return cy.typeOn('Search conferences and meetups.', `${text}{enter}`);
  }

  filterByCfpStatus(status: string) {
    return cy.findByLabelText('Filter by CFP status').click().parent().findByRole('option', { name: status });
  }

  filterByEventTypes(status: string) {
    return cy.findByLabelText('Filter by event types').click().parent().findByRole('option', { name: status });
  }

  results() {
    return cy.findByRole('list', { name: 'Search results' }).children();
  }

  result(name: string) {
    return this.results().contains(name);
  }
}

export default SearchEventPage;
