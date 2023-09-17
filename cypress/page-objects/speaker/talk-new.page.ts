import BasePage from 'page-objects/base.page.ts';

type TalkFormType = {
  title?: string;
  abstract?: string;
  level?: string;
  language?: string;
  references?: string;
};

class SpeakerNewTalkPage extends BasePage {
  visit() {
    cy.visitAndCheck('/speaker/talks/new');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Create a new talk' }).should('exist');
  }

  fillTalkForm(data: TalkFormType) {
    if (data.title) cy.typeOn('Title', data.title);
    if (data.abstract) cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.findByRole('radio', { name: data.level }).click();
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
  }

  createAbstract() {
    return cy.findByRole('button', { name: 'Create new talk' });
  }

  titleInput() {
    return cy.findByLabelText('Title');
  }

  abstractInput() {
    return cy.findByLabelText('Abstract');
  }
}

export default SpeakerNewTalkPage;
