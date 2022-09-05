class OrganizationMembersPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}/members`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Organization members' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Members list' }).children();
  }

  member(name: string) {
    return this.list().contains(name);
  }
}

export default OrganizationMembersPage;
