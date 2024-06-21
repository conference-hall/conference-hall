import BasePage from 'page-objects/base.page.ts';

class SpeakerHomePage extends BasePage {
  visit() {
    cy.visitAndCheck('/speaker');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Speaker activity' }).should('exist');
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
