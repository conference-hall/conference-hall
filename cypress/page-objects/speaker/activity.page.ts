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

  newTalk() {
    return cy.findByRole('link', { name: 'New talk' });
  }
}

export default SpeakerActivityPage;
