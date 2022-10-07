class ProposalReviewPage {
  visit(orgaSlug: string, eventSlug: string, proposalId: string) {
    cy.visit(`/organizer/${orgaSlug}/${eventSlug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal review' }).should('exist');
  }

  closePage() {
    return cy.clickOn('Back to list');
  }

  title(name: string) {
    return cy.findByRole('heading', { name });
  }

  nextProposal() {
    return cy.clickOn('Next');
  }

  previousProposal() {
    return cy.clickOn('Previous');
  }

  toggleOrganizerRatings() {
    return cy.clickOn('Toggle organizer ratings details');
  }

  organizerRatingsSection() {
    return cy.findByLabelText('Organizer ratings details');
  }

  toggleSpeakerDetails(speakerName: string) {
    return cy.clickOn(`Toggle speaker ${speakerName} details`);
  }

  speakerDetailsSection(speakerName: string) {
    return cy.findByLabelText(`Speaker ${speakerName} details`);
  }

  organizerMessagesSection() {
    return cy.findByLabelText('Organizer messages section');
  }
}

export default ProposalReviewPage;
