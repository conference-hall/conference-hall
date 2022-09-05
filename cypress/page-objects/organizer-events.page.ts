class OrganizationEventsPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Organization events' }).should('exist');
  }

  eventsTab() {
    return cy.findByRole('link', { name: 'Events' });
  }

  membersTab() {
    return cy.findByRole('link', { name: 'Members' });
  }

  settingsTab() {
    return cy.findByRole('link', { name: 'Settings' });
  }

  newEvent() {
    return cy.findByRole('link', { name: 'New event' });
  }

  list() {
    return cy.findByRole('list', { name: 'Events list' }).children();
  }

  event(name: string) {
    return this.list().contains(name);
  }
}

export default OrganizationEventsPage;
