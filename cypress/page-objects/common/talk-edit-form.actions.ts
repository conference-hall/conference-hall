type TalkFormType = {
  title?: string;
  abstract?: string;
  level?: string;
  language?: string;
  references?: string;
  format?: string;
  category?: string;
};

class TalkEditFormActions {
  constructor() {
    this.isVisible();
  }

  isVisible() {
    cy.findByRole('heading', { name: 'Edit talk' }).should('exist');
  }

  fillForm(data: TalkFormType) {
    if (data.title) cy.typeOn('Title', data.title);
    if (data.abstract) cy.typeOn('Abstract', data.abstract);
    if (data.level) cy.findByRole('radio', { name: data.level }).click();
    if (data.language) cy.selectOn('Languages', data.language);
    if (data.references) cy.typeOn('References', data.references);
    if (data.format) this.selectFormatTrack(data.format);
    if (data.category) this.selectCategoryTrack(data.category);
  }

  selectFormatTrack(format: string) {
    cy.findByRole('checkbox', { name: format }).click();
  }

  selectCategoryTrack(category: string) {
    cy.findByRole('checkbox', { name: category }).click();
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

export default TalkEditFormActions;
