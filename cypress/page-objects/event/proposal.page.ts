import BasePage from 'page-objects/base.page';

class EventProposalPage extends BasePage {
  visit(slug: string, proposalId: string) {
    cy.visit(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'References' }).should('exist');
  }

  editProposal() {
    return cy.findByRole('link', { name: 'Edit proposal' });
  }

  submitProposal() {
    return cy.findByRole('link', { name: 'Continue submission' });
  }

  confirmProposal() {
    return cy.findByRole('button', { name: 'Confirm your participation' });
  }

  declineProposal() {
    return cy.findByRole('button', { name: 'Decline' });
  }

  deleteProposal() {
    return cy.findByRole('button', { name: 'Delete proposal' });
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to delete your proposal?' });
  }

  cancelDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' });
  }

  confirmDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Delete proposal' });
  }

  generateCoSpeakerInvite() {
    cy.findByRole('button', { name: 'Invite a co-speaker' }).click();
    cy.findByRole('button', { name: 'Generate invitation link' }).click();
    return cy.findByLabelText('Copy invitation link');
  }

  closeCoSpeakerModal() {
    return cy.findByRole('button', { name: 'Close' }).click();
  }

  removeCoSpeaker(speakerName: string) {
    return cy.findByLabelText(`Remove speaker ${speakerName}`);
  }
}

export default EventProposalPage;
