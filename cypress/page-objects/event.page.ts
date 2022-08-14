class EventPage {
  visit(slug: string) {
    cy.visit(`/${slug}`);
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(`/${slug}`);
  }

  name(name: string) {
    return cy.findByRole('heading', { name });
  }
}

export default EventPage;
