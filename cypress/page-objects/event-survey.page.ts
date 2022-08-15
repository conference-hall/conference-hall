class EventSurveyPage {
  visit(slug: string) {
    cy.visit(`/${slug}/survey`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'We have some questions for you.' }).should('exist');
  }

  gender(value: string) {
    return cy.findByRole('radio', { name: value });
  }

  tshirt(value: string) {
    return cy.findByRole('radio', { name: value });
  }

  accommodation(value: string) {
    return cy.findByRole('radio', { name: value });
  }

  transport(value: string) {
    return cy.findByRole('checkbox', { name: value });
  }

  meal(value: string) {
    return cy.findByRole('checkbox', { name: value });
  }

  message() {
    return cy.findByLabelText('Do you have specific information to share?');
  }
}

export default EventSurveyPage;
