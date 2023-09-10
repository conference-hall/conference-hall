import BasePage from 'page-objects/base.page';

class EventProposalsPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/${slug}/proposals`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Your proposals' }).should('exist');
  }

  submitProposal() {
    cy.findByRole('link', { name: 'Submit a proposal' }).click();
  }

  list() {
    return cy.findByRole('list', { name: 'Proposals list' }).children();
  }

  proposal(name: string) {
    return this.list().contains(name);
  }
}

export default EventProposalsPage;
