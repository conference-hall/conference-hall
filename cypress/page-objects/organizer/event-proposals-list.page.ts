class OrganizationEventsProposalsPage {
  visit(orgaSlug: string, eventSlug: string) {
    cy.visit(`/organizer/${orgaSlug}/${eventSlug}/proposals`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Event proposals' }).should('exist');
  }

  table() {
    return cy.findAllByRole('row');
  }

  proposal(name: string) {
    return cy.findByRole('link', { name: `Open proposal "${name}"` });
  }

  filterSearch() {
    return cy.findByLabelText('Find a proposal');
  }

  openFilters() {
    return cy.clickOn('Filters');
  }

  clearFilters() {
    return cy.clickOn('Clear');
  }

  filterRatings(name: string) {
    return cy.selectOn('Rated by you', name);
  }

  filterFormat(name: string) {
    return cy.selectOn('Formats', name);
  }

  filterCategory(name: string) {
    return cy.selectOn('Categories', name);
  }

  filterStatus(name: string) {
    return cy.selectOn('Status', name);
  }

  sortBy(sort: string) {
    return cy.selectOn('Sort', sort);
  }
}

export default OrganizationEventsProposalsPage;
