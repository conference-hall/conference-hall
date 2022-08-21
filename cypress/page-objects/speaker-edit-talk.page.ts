class SpeakerEditTalkPage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}/edit`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('button', { name: 'Save abstract' }).should('exist');
  }
}

export default SpeakerEditTalkPage;
