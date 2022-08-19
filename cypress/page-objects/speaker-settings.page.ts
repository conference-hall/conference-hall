class SpeakerSettingsPage {
  visit() {
    cy.visit('/speaker/settings');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Settings' }).should('exist');
  }
}

export default SpeakerSettingsPage;
