class EventPage {
  visit(slug: string) {
    cy.visit(`/${slug}`);
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(`/${slug}`);
  }

  submitButton() {
    return cy.findAllByRole('link', { name: 'Submit a proposal' }).first();
  }
}

export default EventPage;
