class SearchEventPage {
  visit(searchParams?: string) {
    cy.visit(`/${searchParams || ''}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Conferences and meetups.' }).should('exist');
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
