class SurveySettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/survey`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Speaker survey' }).should('exist');
  }

  enableSurvey() {
    return cy.findByRole('button', { name: 'Enable survey' });
  }

  disableSurvey() {
    return cy.findByRole('button', { name: 'Disable survey' });
  }

  saveQuestion() {
    return cy.findByRole('button', { name: 'Save questions' });
  }
}

export default SurveySettings;
