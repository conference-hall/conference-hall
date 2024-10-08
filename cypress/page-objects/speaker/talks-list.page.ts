import BasePage from 'page-objects/base.page.ts';

class SpeakerTalksPage extends BasePage {
  visit() {
    cy.visitAndCheck('/speaker/talks');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Talks library' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Talks list' }).children();
  }

  talk(name: string) {
    return this.list().contains(name);
  }

  displayArchivedTalks() {
    return cy.findByRole('link', { name: 'Archived' }).click();
  }

  displayAllTalks() {
    return cy.findByRole('link', { name: 'All' }).click();
  }

  createNewTalk() {
    return cy.findByRole('link', { name: 'New talk' });
  }
}

export default SpeakerTalksPage;
