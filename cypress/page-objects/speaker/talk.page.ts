class SpeakerTalkPage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }

  submitTalk() {
    return cy.findByRole('link', { name: 'Submit' });
  }

  openActions() {
    cy.findByRole('button', { name: 'Actions' }).click();
  }

  editTalk() {
    this.openActions();
    cy.findByRole('menuitem', { name: 'Edit' }).click();
  }

  deleteTalk() {
    this.openActions();
    cy.findByRole('menuitem', { name: 'Delete' }).click();
  }

  archiveTalk() {
    this.openActions();
    cy.findByRole('menuitem', { name: 'Archive' }).click();
  }

  restoreTalk() {
    cy.findByRole('button', { name: 'Restore' }).click();
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to delete your talk?' });
  }

  cancelDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' }).click();
  }

  confirmDelete() {
    this.deleteConfirmDialog().findByRole('button', { name: 'Delete talk' }).click();
  }

  speakersBlock() {
    return cy.findByRole('heading', { name: 'Speakers' }).parent();
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

export default SpeakerTalkPage;
