class SpeakerActivityPage {
  visit() {
    cy.visit('/speaker');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Your activity' }).should('exist');
  }

  editProfile() {
    return cy.findByRole('link', { name: 'Edit profile' });
  }

  submitTalk() {
    return cy.findByRole('link', { name: 'Submit a talk' });
  }
}

export default SpeakerActivityPage;
