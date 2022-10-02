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

  editTalk() {
    cy.clickOn('Actions');
    return cy.findByRole('menuitem', { name: 'Edit' });
  }

  deleteTalk() {
    cy.clickOn('Actions');
    return cy.findByRole('menuitem', { name: 'Delete' });
  }

  archiveTalk() {
    cy.clickOn('Actions');
    return cy.findByRole('menuitem', { name: 'Archive' });
  }

  restoreTalk() {
    return cy.findByRole('button', { name: 'Restore' });
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to delete your talk?' });
  }

  cancelDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' });
  }

  confirmDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Delete talk' });
  }

  speakersBlock() {
    return cy.findByRole('heading', { name: 'Speakers' }).parent();
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

export default SpeakerTalkPage;
