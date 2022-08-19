class SpeakerNewTalkPage {
  visit() {
    cy.visit('/speaker/talks/new');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'New talk abstract' }).should('exist');
  }
}

export default SpeakerNewTalkPage;
