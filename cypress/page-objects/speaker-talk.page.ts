class SpeakerTalkPage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }
}

export default SpeakerTalkPage;
