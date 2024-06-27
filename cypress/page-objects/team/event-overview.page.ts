import BasePage from '../../page-objects/base.page.ts';

class ProposalOverview extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Event overview' }).should('exist');
  }

  dashboardCard(name: string) {
    return cy.findByLabelText(name);
  }

  cardActionLink(name: string) {
    return cy.findByRole('link', { name });
  }
}

export default ProposalOverview;
