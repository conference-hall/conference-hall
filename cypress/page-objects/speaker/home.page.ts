import BasePage from 'page-objects/base.page';

class SpeakerHomePage extends BasePage {
  visit() {
    cy.visit('/speaker');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Welcome to Conference Hall' }).should('exist');
  }

  editProfile() {
    return cy.findByRole('link', { name: 'Edit your profile' });
  }

  newTalk() {
    return cy.findByRole('link', { name: 'New talk' });
  }

  activities() {
    return cy.findByRole('list', { name: 'Activities list' }).children();
  }

  activity(name: string) {
    return this.activities().contains(name);
  }

  eventActivities(name: string) {
    return cy.findByRole('list', { name: `${name} activities` }).children();
  }
}

export default SpeakerHomePage;
