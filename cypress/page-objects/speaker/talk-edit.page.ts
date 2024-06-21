import BasePage from 'page-objects/base.page.ts';

type TalkFormType = {
  title?: string;
  abstract?: string;
  level?: string;
  language?: string;
  references?: string;
};

class SpeakerEditTalkPage extends BasePage {
  visit(talkId: string) {
    cy.visitAndCheck(`/speaker/talks/${talkId}/edit`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Edit talk' }).should('exist');
  }

  fillTalkForm(data: TalkFormType) {
    if (data.title) cy.typeOn('Title', data.title);
    if (data.abstract) cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.findByRole('radio', { name: data.level }).click();
    if (data.references) cy.typeOn('References', data.references);
    if (data.language) cy.selectOn('Languages', data.language);
  }

  save() {
    cy.findByRole('button', { name: 'Save' }).click();
  }

  close() {
    cy.findByRole('button', { name: 'Cancel' }).click();
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-describe`);
      });
  }
}

export default SpeakerEditTalkPage;
