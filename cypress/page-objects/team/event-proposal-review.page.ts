import BasePage from '../../page-objects/base.page.ts';

type ProposalFormType = {
  title: string;
  abstract: string;
  level: string;
  language: string;
  references: string;
  format: string;
  category: string;
};

class ProposalReviewPage extends BasePage {
  visit(teamSlug: string, eventSlug: string, proposalId: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/review/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Review information' }).should('exist');
  }

  title(name: string) {
    return cy.findByRole('heading', { name });
  }

  // Navigation

  nextProposal() {
    cy.findByRole('link', { name: 'Next proposal' }).click();
  }

  previousProposal() {
    cy.findByRole('link', { name: 'Previous proposal' }).click();
  }

  close() {
    cy.findByRole('link', { name: 'Close review' }).click();
  }

  // Proposal

  proposalTab() {
    cy.findByRole('link', { name: 'Proposal' }).click();
  }

  // Speakers

  speakersTab() {
    cy.findByRole('link', { name: /Speakers/ }).click();
  }

  speakersList() {
    return cy.findByRole('list', { name: 'Speakers list' }).children();
  }

  // Reviews

  reviewsTab() {
    cy.findByRole('link', { name: /Reviews/ }).click();
  }

  reviewsList() {
    return cy.findByRole('list', { name: 'Organizers reviews' }).children();
  }

  // Discussions

  discussionsTab() {
    cy.findByRole('link', { name: /Discussions/ }).click();
  }

  discussionMessages() {
    return cy.findByRole('list', { name: 'Organizers messages' }).children();
  }

  writeMessage(comment: string) {
    cy.typeOn('Write a message to other organizers', comment);
    cy.findByRole('button', { name: 'Send' }).click();
  }

  deleteMessage() {
    return cy.findByLabelText('Delete message').click({ force: true });
  }

  // Review proposal

  fillReview(review: string, comment: string) {
    cy.findByRole('radio', { name: review }).click();
    cy.typeOn('Review comment', comment);
    cy.findByRole('button', { name: 'Save review' }).click();
  }

  fillReviewAndGoToNext(review: string, comment: string) {
    cy.findByRole('radio', { name: review }).click();
    cy.typeOn('Review comment', comment);
    cy.findByRole('button', { name: 'Save & Next' }).click();
  }

  // Edit proposal

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
