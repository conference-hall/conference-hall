class EventProposalsPage {
  visit(slug: string) {
    cy.visit(`/${slug}/proposals`);
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(`/${slug}/proposals`);
    cy.findByRole('heading', { name: 'Your proposals' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Proposals list' }).children();
  }

  proposal(name: string) {
    return this.list().contains(name);
  }
}

export default EventProposalsPage;
