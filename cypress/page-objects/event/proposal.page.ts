import BasePage from 'page-objects/base.page.ts';
import TalkCoSpeakersActions from 'page-objects/common/talk-co-speakers.actions.ts';
import TalkEditFormActions from 'page-objects/common/talk-edit-form.actions.ts';

class EventProposalPage extends BasePage {
  visit(slug: string, proposalId: string) {
    cy.visitAndCheck(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal page' }).should('exist');
  }

  openReferences() {
    cy.findByText('Talk references').click();
  }

  editProposal() {
    cy.findByRole('button', { name: 'Edit' }).click();
    return new TalkEditFormActions();
  }

  cospeakers() {
    return new TalkCoSpeakersActions();
  }

  submitProposal() {
    cy.findByRole('link', { name: 'Continue submission' }).click();
  }

  confirmProposal() {
    cy.findByRole('button', { name: 'Confirm' }).click();
  }

  declineProposal() {
    cy.findByRole('button', { name: 'Decline' }).click();
  }

  deleteProposal() {
    cy.findByRole('button', { name: 'Remove proposal' }).click();
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to remove your submission?' });
  }

  cancelDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' }).click();
  }

  confirmDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Remove proposal' }).click();
  }
}

export default EventProposalPage;
