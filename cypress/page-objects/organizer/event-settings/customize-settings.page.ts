class CustomizeSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/customize`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Customize event banner' }).should('exist');
  }

  uploadBanner() {
    return cy.findByLabelText('Change banner');
  }
}

export default CustomizeSettings;
