class OrganizerEventSettingsPage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Settings' }).should('exist');
  }

  settingsNav() {
    return cy.findByRole('navigation', { name: 'Event settings menu' });
  }
}

export default OrganizerEventSettingsPage;
