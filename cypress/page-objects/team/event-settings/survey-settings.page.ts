import BasePage from 'page-objects/base.page';

class SurveySettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/team/${slug}/${eventSlug}/settings/survey`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Speaker survey' }).should('exist');
  }

  toggleSurvey() {
    return cy.findByLabelText('Speaker survey activation');
  }

  saveQuestion() {
    return cy.findByRole('button', { name: 'Save questions' });
  }
}

export default SurveySettings;
