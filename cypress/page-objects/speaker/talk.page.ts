import BasePage from 'page-objects/base.page';

class SpeakerTalkPage extends BasePage {
  visit(talkId: string) {
    cy.visitAndCheck(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
    cy.findByRole('heading', { name: 'Submissions' }).should('exist');
  }

  submitTalk() {
    cy.findByRole('link', { name: 'Submit talk' }).click();
  }

  editTalk() {
    cy.findByRole('link', { name: 'Edit' }).click();
  }

  archiveTalk() {
    cy.findByRole('button', { name: 'Archive' }).click();
  }

  restoreTalk() {
    cy.findByRole('button', { name: 'Restore' }).click();
  }
}

export default SpeakerTalkPage;
