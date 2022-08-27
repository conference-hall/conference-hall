class EventPage {
  visit(slug: string) {
    cy.visit(`/${slug}`, { failOnStatusCode: false });
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(`/${slug}`);
  }

  submitButton() {
    return cy.findAllByRole('link', { name: 'Submit a proposal' }).first();
  }

  searchForEvent() {
    return cy.findAllByRole('link', { name: 'Search for event' }).first();
  }
}

export default EventPage;
