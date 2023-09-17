import BasePage from 'page-objects/base.page.ts';

class SpeakerTalksPage extends BasePage {
  visit() {
    cy.visitAndCheck('/speaker/talks');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Your talks library' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Talks list' }).children();
  }

  talk(name: string) {
    return this.list().contains(name);
  }

  filterByTalkStatus(status: string) {
    return cy.findByLabelText('Talk status').click().parent().findByRole('option', { name: status });
  }

  createNewTalk() {
    return cy.findByRole('link', { name: 'New talk' });
  }
}

export default SpeakerTalksPage;
