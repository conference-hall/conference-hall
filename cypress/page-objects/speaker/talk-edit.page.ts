type TalkFormType = {
  title?: string;
  abstract?: string;
  level?: string;
  language?: string;
  references?: string;
};

class SpeakerEditTalkPage {
  visit(talkId: string) {
    cy.visit(`/speaker/talks/${talkId}/edit`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('button', { name: 'Save abstract' }).should('exist');
  }

  fillTalkForm(data: TalkFormType) {
    if (data.title) cy.typeOn('Title', data.title);
    if (data.abstract) cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.clickOn(data.level);
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  saveAbstract() {
    return cy.findByRole('button', { name: 'Save abstract' });
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }
}

export default SpeakerEditTalkPage;
