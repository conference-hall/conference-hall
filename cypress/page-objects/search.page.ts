import BasePage from './base.page.ts';

class SearchEventPage extends BasePage {
  visit(searchParams?: string) {
    cy.visitAndCheck(`/${searchParams || ''}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByText('Call for papers for conferences and meetups.').should('exist');
    cy.findByRole('searchbox', { name: 'Search conferences and meetups.' }).should('exist');
  }

  search(text: string) {
    return cy.typeOn('Search conferences and meetups.', `${text}{enter}`);
  }

  filterByAllTypes() {
    return cy.findByRole('link', { name: 'All' }).click();
  }

  filterByConferences() {
    return cy.findByRole('link', { name: 'Conferences' }).click();
  }

  filterByMeetups() {
    return cy.findByRole('link', { name: 'Meetups' }).click();
  }

  results() {
    return cy.findByRole('list', { name: 'Search results' }).children();
  }

  result(name: string) {
    return this.results().contains(name);
  }
}

export default SearchEventPage;
