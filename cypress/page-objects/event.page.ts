class EventPage {
  visit(slug: string) {
    cy.visit(`/${slug}`);
  }

  name(name: string) {
    return cy.findByRole('heading', { name });
  }
}

export default EventPage;
