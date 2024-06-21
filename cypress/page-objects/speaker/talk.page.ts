import BasePage from 'page-objects/base.page.ts';

import SpeakerEditTalkPage from './talk-edit.page.ts';

class SpeakerTalkPage extends BasePage {
  visit(talkId: string) {
    cy.visitAndCheck(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Talk page' }).should('exist');
  }

  submitTalk() {
    cy.findByRole('link', { name: 'Submit talk' }).click();
  }

  editTalk() {
    cy.findByRole('button', { name: 'Edit' }).click();
    return new SpeakerEditTalkPage();
  }

  archiveTalk() {
    cy.findByRole('button', { name: 'Archive' }).click();
  }

  restoreTalk() {
    cy.findByRole('button', { name: 'Restore' }).click();
  }

  speakerButton(name: string) {
    return cy.findByRole('button', { name: `View ${name} profile` });
  }

  openReferences() {
    cy.findByText('Talk references').click();
  }

  addSpeaker() {
    cy.findByRole('button', { name: 'Add a co-speaker' }).click();
    return cy.findByLabelText('Copy invitation link');
  }

  closeSpeakerModal() {
    cy.findByRole('button', { name: 'Close' }).click();
  }

  removeCoSpeaker(speakerName: string) {
    cy.findByRole('button', { name: `Remove "${speakerName}" from the talk` }).click();
  }
}

export default SpeakerTalkPage;
