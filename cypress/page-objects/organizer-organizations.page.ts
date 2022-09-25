class OrganizationsPage {
  visit() {
    cy.visit('/organizer');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Select an organization' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Organizations list' }).children();
  }

  organization(name: string) {
    return this.list().contains(name);
  }

  newOrganization() {
    return cy.findByRole('link', { name: 'New organization' });
  }
}

export default OrganizationsPage;
