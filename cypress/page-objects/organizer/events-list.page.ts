class OrganizationEventsPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Events' }).should('exist');
  }

  eventsTab() {
    return cy.findByRole('link', { name: 'Organization events' });
  }

  membersTab() {
    return cy.findByRole('link', { name: 'Members' });
  }

  settingsTab() {
    return cy.findByRole('link', { name: 'Settings' });
  }

  newEvent() {
    cy.findByRole('link', { name: 'New event' }).click();
  }

  list() {
    return cy.findByRole('list', { name: 'Events list' }).children();
  }

  event(name: string) {
    return this.list().contains(name);
  }
}

export default OrganizationEventsPage;
