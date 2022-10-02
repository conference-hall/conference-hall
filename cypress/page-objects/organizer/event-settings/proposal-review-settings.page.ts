class ProposalReviewSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/review`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposals review' }).should('exist');
  }

  enableProposalReview() {
    return cy.findByRole('button', { name: 'Enable proposal review' });
  }

  disableProposalReview() {
    return cy.findByRole('button', { name: 'Disable proposal review' });
  }
}

export default ProposalReviewSettings;
