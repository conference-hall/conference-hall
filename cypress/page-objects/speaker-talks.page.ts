class SpeakerTalksPage {
  visit() {
    return cy.visit('/speaker/talks');
  }

  title() {
    return cy.findByText('Your talks');
  }
}

export default SpeakerTalksPage;
