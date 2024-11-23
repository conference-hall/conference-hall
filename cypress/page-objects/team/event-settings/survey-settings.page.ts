import BasePage from '../../../page-objects/base.page.ts';

class SurveySettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/survey`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Speaker survey' }).should('exist');
  }

  toggleSurvey() {
    return cy.findByLabelText('Speaker survey activation');
  }

  legacy_saveQuestion() {
    return cy.findByRole('button', { name: 'Save questions' });
  }

  addQuestion() {
    return cy.findByRole('button', { name: 'Add question' });
  }

  editQuestion() {
    return cy.findByRole('button', { name: 'Edit' });
  }

  deleteQuestion() {
    return cy.findByRole('button', { name: 'Delete' });
  }

  createQuestion(question: string, type: 'text' | 'checkbox' | 'radio', required: boolean, options: string[] = []) {
    cy.findByRole('dialog').within(() => {
      cy.findByLabelText('Question').type(question);
      cy.findByLabelText('type').select(type);
      if (required) {
        cy.findByLabelText('This question is required').check();
      }
      for (const option of options) {
        cy.findByPlaceholderText('New answer').type(option);
        cy.findByRole('button', { name: 'Add answer' }).click();
      }
      cy.findByRole('button', { name: 'Add question' }).click();
    });
  }

  updateQuestion(question: string) {
    cy.findByRole('dialog').within(() => {
      cy.findByLabelText('Question').clear();
      cy.findByLabelText('Question').type(question);
      cy.findByRole('button', { name: 'Save question' }).click();
    });
  }
}

export default SurveySettings;
