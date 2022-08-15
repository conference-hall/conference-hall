class EventProposalPage {
  visit(slug: string, proposalId: string) {
    cy.visit(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }
}

export default EventProposalPage;
