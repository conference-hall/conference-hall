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

  organizerCommentsSection() {
    return cy.findByLabelText('Organizer messages section');
  }

  bottomActionSection() {
    return cy.findByLabelText('Review proposal actions section');
  }

  rate(rating: string) {
    return cy.clickOn(rating);
  }

  writeComment(comment: string) {
    cy.typeOn('Write a comment to other organizers', comment);
    return cy.clickOn('Send');
  }

  deleteComment() {
    return cy.findByRole('button', { name: '', hidden: true }).click({ force: true });
  }

  editProposal() {
    return cy.clickOn('Edit proposal');
  }

  fillProposalForm(data: ProposalFormType) {
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    cy.clickOn(data.level);
    cy.selectOn('Languages', data.language);
    cy.typeOn('References', data.references);
    cy.clickOn(data.format);
    cy.clickOn(data.category);
    return cy.clickOn('Save proposal');
  }

  cancelUpdateProposal() {
    return cy.clickOn('Cancel');
  }
}

export default ProposalReviewPage;
