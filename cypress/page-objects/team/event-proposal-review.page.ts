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
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/reviews/${proposalId}`);
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

  goBackToList() {
    cy.findByRole('link', { name: 'Proposals' }).click();
  }

  // Proposal

  proposalTab() {
    cy.findByRole('link', { name: 'Proposal' }).click();
  }

  // Speakers

  speakersList() {
    return cy.findByRole('list', { name: 'Speakers' }).children();
  }

  speaker(name: RegExp) {
    return cy.findByRole('button', { name });
  }

  withinSpeakerProfile(name: RegExp, callback: () => void) {
    this.speaker(name).click();
    return cy.findByRole('dialog', { name: name }).within(callback);
  }

  // Activity feed

  activityFeed() {
    return cy.findByRole('list', { name: 'Activity feed' }).children();
  }

  addComment(comment: string) {
    cy.findByRole('list', { name: 'Activity feed' })
      .parent()
      .within(() => {
        cy.typeOn('Add your comment', comment);
        cy.findByRole('button', { name: 'Comment' }).click();
      });
  }

  deleteComment() {
    return cy.findByLabelText('delete').click();
  }

  // Review proposal

  yourReviewPanel() {
    return cy.findByRole('heading', { name: 'Your review' }).parent();
  }

  review(review: string) {
    this.yourReviewPanel().within(() => {
      cy.findByRole('radio', { name: review }).click();
    });
  }

  // Deliberation & Publication

  deliberationStatus() {
    return cy.findByLabelText('Change deliberation status');
  }

  deliberate(status: RegExp) {
    this.deliberationStatus().click();
    cy.findByRole('option', { name: status }).click();
  }

  publicationHeading() {
    return cy.findByRole('heading', { name: 'Publication' });
  }

  publicationPanel() {
    return this.publicationHeading().parent();
  }

  publishResult() {
    return cy.findByRole('button', { name: 'Publish result to speakers' }).click();
  }

  confirmationPanel() {
    return cy.findByRole('heading', { name: 'Confirmation' }).parent();
  }

  // Edit proposal

  editProposal() {
    cy.findByRole('button', { name: 'Edit' }).click();
  }

  fillProposalForm(data: ProposalFormType) {
    cy.typeOn('Title', data.title);
    cy.typeOn('Abstract', data.abstract);
    cy.findByRole('radio', { name: data.level }).click();
    cy.selectOn('Languages', data.language);
    cy.typeOn('References', data.references);
    cy.findByRole('checkbox', { name: data.format }).click();
    cy.findByRole('checkbox', { name: data.category }).click();
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('button', { name: 'Cancel' }).click();
  }

  cancelUpdateProposal() {
    return cy.findByRole('button', { name: 'Cancel' }).click();
  }
}

export default ProposalReviewPage;
