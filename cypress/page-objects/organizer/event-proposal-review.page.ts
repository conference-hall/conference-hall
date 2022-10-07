class ProposalReviewPage {
  visit(orgaSlug: string, eventSlug: string, proposalId: string) {
    cy.visit(`/organizer/${orgaSlug}/${eventSlug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal review' }).should('exist');
  }
}

export default ProposalReviewPage;
