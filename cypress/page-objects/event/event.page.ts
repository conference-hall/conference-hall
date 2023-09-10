import BasePage from 'page-objects/base.page';

class EventPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/${slug}`, { failOnStatusCode: false });
    this.isPageVisible(slug);
  }

  isPageVisible(slug: string) {
    cy.assertUrl(`/${slug}`);
  }

  submitButton() {
    cy.findAllByRole('link', { name: 'Submit a proposal' }).click();
  }

  searchForEvent() {
    cy.findAllByRole('link', { name: 'Search for event' }).click();
  }
}

export default EventPage;
