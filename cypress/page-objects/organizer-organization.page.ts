class OrganizationPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Organization page' }).should('exist');
  }
}

export default OrganizationPage;
