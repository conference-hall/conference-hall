class EventProposalPage {
  visit(slug: string, proposalId: string) {
    cy.visit(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(new RegExp(`/${slug}/proposals/(.*)`));
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }
}

export default EventProposalPage;
