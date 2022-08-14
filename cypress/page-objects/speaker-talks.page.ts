class SpeakerTalksPage {
  visit() {
    cy.visit('/speaker/talks');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Your talks' }).should('exist');
  }
}

export default SpeakerTalksPage;
