import BasePage from 'page-objects/base.page';

type TalkFormType = {
  title?: string;
  abstract?: string;
  level?: string;
  language?: string;
  references?: string;
};

class SpeakerEditTalkPage extends BasePage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}/edit`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('button', { name: 'Save talk' }).should('exist');
  }

  fillTalkForm(data: TalkFormType) {
    if (data.title) cy.typeOn('Title', data.title);
    if (data.abstract) cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.findByRole('radio', { name: data.level }).click();
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  saveAbstract() {
    cy.findByRole('button', { name: 'Save talk' }).click();
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }

  coSpeakerInvite() {
    cy.findByRole('button', { name: 'Invite a co-speaker' }).click();
    return cy.findByLabelText('Copy invitation link');
  }

  closeCoSpeakerModal() {
    return cy.findByRole('button', { name: 'Close' }).click();
  }

  removeCoSpeaker(speakerName: string) {
    return cy.findByLabelText(`Remove speaker ${speakerName}`);
  }
}

export default SpeakerEditTalkPage;
