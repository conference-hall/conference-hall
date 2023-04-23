class CustomizeSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/customize`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Customize event logo' }).should('exist');
  }

  uploadBanner() {
    return cy.findByLabelText('Change logo');
  }
}

export default CustomizeSettings;
