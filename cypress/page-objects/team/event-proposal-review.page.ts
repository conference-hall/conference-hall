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

  speakersList() {
    return cy.findByRole('list', { name: 'Speakers' }).children();
  }

  viewSpeakerProfile(name: RegExp) {
    cy.findByRole('link', { name }).click();
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

  addReviewComment(comment: string) {
    this.yourReviewPanel().within(() => {
      cy.typeOn('Add your comment', comment);
      cy.findByRole('button', { name: 'Comment' }).click();
    });
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
    return cy.findByRole('button', { name: 'Cancel' }).click();
  }
}

export default ProposalReviewPage;
