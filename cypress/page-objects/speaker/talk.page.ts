import BasePage from 'page-objects/base.page.ts';
import TalkCoSpeakersActions from 'page-objects/common/talk-co-speakers.actions.ts';

import TalkEditFormActions from '../common/talk-edit-form.actions.ts';

class SpeakerTalkPage extends BasePage {
  visit(talkId: string) {
    cy.visitAndCheck(`/speaker/talks/${talkId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Talk page' }).should('exist');
  }

  openReferences() {
    cy.findByText('Talk references').click();
  }

  submitTalk() {
    cy.findByRole('link', { name: 'Submit talk' }).click();
  }

  editTalk() {
    cy.findByRole('button', { name: 'Edit' }).click();
    return new TalkEditFormActions();
  }

  cospeakers() {
    return new TalkCoSpeakersActions();
  }

  archiveTalk() {
    cy.findByRole('button', { name: 'Archive' }).click();
  }

  restoreTalk() {
    cy.findByRole('button', { name: 'Restore' }).click();
  }
}

export default SpeakerTalkPage;
