class NotificationsSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings/notifications`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Email notifications' }).should('exist');
  }

  saveForm(email: string) {
    cy.typeOn('Notification email', email);
    cy.clickOn("Send notifications directly to organizer's emails");
    cy.clickOn('Save email notifications');
  }
}

export default NotificationsSettings;
