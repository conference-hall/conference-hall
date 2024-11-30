import BasePage from 'page-objects/base.page.ts';

class EventSurveyPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/${slug}/survey`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'We have some questions for you.' }).should('exist');
  }

  submit() {
    return cy.findByRole('button', { name: 'Save survey' });
  }

  accommodation(value: string) {
    return cy.findByRole('radio', { name: value });
  }

  transport(value: string) {
    return cy.findByRole('checkbox', { name: value });
  }

  message() {
    return cy.findByLabelText('Do you have specific information to share?');
  }
}

export default EventSurveyPage;
