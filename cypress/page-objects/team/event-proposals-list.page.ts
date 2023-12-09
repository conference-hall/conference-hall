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

  markAs(name: 'Accepted' | 'Rejected' | 'Pending') {
    cy.findByRole('button', { name }).click();
    cy.findByRole('button', { name: `Mark as ${name}` }).click();
  }

  filterSearch() {
    return cy.findByLabelText('Search proposals');
  }

  clearFilters() {
    cy.findByRole('button', { name: 'Filters' }).click();
    cy.findByRole('link', { name: 'Reset' }).click();
  }

  filterReviews(name: string) {
    cy.findByRole('button', { name: 'Filters' }).click();
    cy.findByRole('radio', { name }).click();
    cy.findByRole('button', { name: 'Apply now' }).click();
  }

  filterStatus(name: string) {
    cy.findByRole('button', { name: 'Filters' }).click();
    cy.findByRole('radio', { name }).click();
    cy.findByRole('button', { name: 'Apply now' }).click();
  }

  filterFormat(name: string) {
    cy.findByRole('button', { name: 'Filters' }).click();
    cy.selectOn('Formats', name, false);
    cy.findByRole('button', { name: 'Apply now' }).click();
  }

  filterCategory(name: string) {
    cy.findByRole('button', { name: 'Filters' }).click();
    cy.selectOn('Categories', name, false);
    cy.findByRole('button', { name: 'Apply now' }).click();
  }

  sortBy(sort: string) {
    cy.findByRole('button', { name: 'Sort' }).click();
    cy.findByRole('menuitem', { name: sort }).click();
  }
}

export default OrganizationEventsProposalsPage;
