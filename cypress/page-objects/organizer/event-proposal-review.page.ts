type ProposalFormType = {
  title: string;
  abstract: string;
  level: string;
  language: string;
  references: string;
  format: string;
  category: string;
};

class ProposalReviewPage {
  visit(orgaSlug: string, eventSlug: string, proposalId: string) {
    cy.visit(`/organizer/${orgaSlug}/${eventSlug}/review/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal review' }).should('exist');
  }

  closePage() {
    return cy.findByRole('link', { name: 'Back to list' }).click();
  }

  title(name: string) {
    return cy.findByRole('heading', { name });
  }

  nextProposal() {
    cy.findByRole('link', { name: 'Next' }).click();
  }

  previousProposal() {
    cy.findByRole('link', { name: 'Previous' }).click();
  }

  toggleOrganizerRatings() {
    cy.findByRole('button', { name: 'Toggle organizer ratings details' }).click();
  }

  organizerRatingsSection() {
    return cy.findByLabelText('Organizer ratings details');
  }

  toggleSpeakerDetails(speakerName: string) {
    cy.findByRole('button', { name: `Toggle speaker ${speakerName} details` }).click();
  }

  speakerDetailsSection(speakerName: string) {
    return cy.findByLabelText(`Speaker ${speakerName} details`);
  }

  organizerCommentsSection() {
    return cy.findByLabelText('Organizer messages section');
  }

  bottomActionSection() {
    return cy.findByLabelText('Review proposal actions section');
  }

  rate(rating: string) {
    return cy.findByRole('radio', { name: rating }).click();
  }

  writeComment(comment: string) {
    cy.typeOn('Write a comment to other organizers', comment);
    cy.findByRole('button', { name: 'Send' }).click();
  }

  deleteComment() {
    return cy.findByLabelText('Delete comment').click({ force: true });
  }

  editProposal() {
    cy.findByRole('link', { name: 'Edit proposal' }).click();
  }

  fillProposalForm(data: ProposalFormType) {
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    cy.findByRole('radio', { name: data.level }).click();
    cy.selectOn('Languages', data.language);
    cy.typeOn('References', data.references);
    cy.findByRole('checkbox', { name: data.format }).click();
    cy.findByRole('checkbox', { name: data.category }).click();
    cy.findByRole('button', { name: 'Save proposal' }).click();
  }

  cancelUpdateProposal() {
    return cy.findByRole('link', { name: 'Cancel' }).click();
  }
}

export default ProposalReviewPage;
