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

  selectProposal(name: string) {
    return cy.findByRole('checkbox', { name: `Select proposal "${name}"` });
  }

  markAs(name: string) {
    cy.clickOn('Mark as...');
    return cy.findByRole('button', { name }).click();
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
    return cy.selectOn('Rated by you', name, false);
  }

  filterFormat(name: string) {
    return cy.selectOn('Formats', name, false);
  }

  filterCategory(name: string) {
    return cy.selectOn('Categories', name, false);
  }

  filterStatus(name: string) {
    return cy.selectOn('Status', name, false);
  }

  sortBy(sort: string) {
    return cy.selectOn('Sort', sort, false);
  }
}

export default OrganizationEventsProposalsPage;
