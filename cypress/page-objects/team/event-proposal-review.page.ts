import TalkCoSpeakersActions from 'page-objects/common/talk-co-speakers.actions.ts';
import TalkEditFormActions from 'page-objects/common/talk-edit-form.actions.ts';

import BasePage from '../../page-objects/base.page.ts';

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

  openTalkReferences() {
    cy.findByRole('button', { name: 'Talk references' }).click();
  }

  openOtherProposals() {
    cy.findByRole('button', { name: /Other proposals by speakers/ }).click();
  }

  // Speakers

  cospeakers() {
    return new TalkCoSpeakersActions();
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
    return cy.findByRole('heading', { name: 'Speakers confirmation' }).parent();
  }

  // Edit proposal

  editProposal() {
    cy.findByRole('button', { name: 'Edit' }).click();
    return new TalkEditFormActions();
  }
}

export default ProposalReviewPage;
