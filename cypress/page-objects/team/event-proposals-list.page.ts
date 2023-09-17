import BasePage from '../../page-objects/base.page.ts';

class OrganizationEventsProposalsPage extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}`);
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
    cy.findByRole('button', { name: 'Mark as...' }).click();
    cy.findByRole('button', { name }).click();
  }

  filterSearch() {
    return cy.findByLabelText('Find a proposal');
  }

  clearFilters() {
    cy.findByRole('link', { name: 'Reset filters' }).click();
  }

  filterReviews(name: string) {
    cy.findByRole('button', { name }).click();
  }

  filterStatus(name: string) {
    cy.findByRole('button', { name }).click();
  }

  filterFormat(name: string) {
    return cy.selectOn('Formats', name, false);
  }

  filterCategory(name: string) {
    return cy.selectOn('Categories', name, false);
  }

  sortBy(sort: string) {
    cy.findByRole('button', { name: 'Sort by...' }).click();
    cy.findByRole('menuitem', { name: sort }).click();
  }
}

export default OrganizationEventsProposalsPage;
