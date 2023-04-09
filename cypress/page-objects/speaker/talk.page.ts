class SpeakerTalkPage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }

  submitTalk() {
    cy.findByRole('link', { name: 'Submit talk' }).click();
  }

  editTalk() {
    cy.findByRole('link', { name: 'Edit' }).click();
  }

  archiveTalk() {
    cy.findByRole('button', { name: 'Archive' }).click();
  }

  restoreTalk() {
    cy.findByRole('button', { name: 'Restore' }).click();
  }
}

export default SpeakerTalkPage;
