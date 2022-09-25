class OrganizerEventSettingsPage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Settings' }).should('exist');
  }
}

export default OrganizerEventSettingsPage;
