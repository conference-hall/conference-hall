class CustomizeSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/customize`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Customize event logo' }).should('exist');
  }

  changeLogo() {
    return cy.findByLabelText('Change logo');
  }

  getLogoSrc() {
    return cy.findByAltText('Logo of Conference 1').should('have.attr', 'src');
  }
}

export default CustomizeSettings;
