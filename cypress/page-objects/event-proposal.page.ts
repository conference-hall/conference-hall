class EventProposalPage {
  visit(slug: string, proposalId: string) {
    cy.visit(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }

  editProposal() {
    return cy.findByRole('link', { name: 'Edit proposal' });
  }

  submitProposal() {
    return cy.findByRole('link', { name: 'Submit proposal' });
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
    cy.clickOn('Invite a co-speaker');
    cy.clickOn('Generate invitation link');
    return cy.findByLabelText('Copy invitation link');
  }

  closeCoSpeakerModal() {
    return cy.clickOn('Close');
  }

  removeCoSpeaker(speakerName: string) {
    return cy.findByLabelText(`Remove speaker ${speakerName}`);
  }
}

export default EventProposalPage;
