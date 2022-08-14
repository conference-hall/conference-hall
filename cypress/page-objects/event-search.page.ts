class SearchEventPage {
  visit() {
    cy.visit('/');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Conferences and meetups.' }).should('exist');
  }

  search(text: string) {
    return cy.typeOn('Search conferences and meetups.', `${text}{enter}`);
  }

  results() {
    return cy.findByRole('list', { name: 'Search results' }).children();
  }

  result(name: string) {
    return this.results().contains(name);
  }
}

export default SearchEventPage;
