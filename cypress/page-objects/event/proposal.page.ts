import BasePage from 'page-objects/base.page.ts';

import EventEditProposalPage from './proposal-edit.page.ts';

class EventProposalPage extends BasePage {
  visit(slug: string, proposalId: string) {
    cy.visitAndCheck(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal page' }).should('exist');
  }

  editProposal() {
    cy.findByRole('button', { name: 'Edit' }).click();
    return new EventEditProposalPage();
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
    cy.findByRole('button', { name: 'Delete proposal' }).click();
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to delete your proposal?' });
  }

  cancelDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' }).click();
  }

  confirmDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Delete proposal' }).click();
  }

  speakerButton(name: string) {
    return cy.findByRole('button', { name: `View ${name} profile` });
  }

  openReferences() {
    cy.findByText('Talk references').click();
  }
}

export default EventProposalPage;
