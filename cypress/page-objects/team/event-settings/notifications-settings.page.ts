import BasePage from 'page-objects/base.page';

class NotificationsSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/notifications`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Email notifications' }).should('exist');
  }

  saveForm(email: string) {
    cy.typeOn('Email receiving notifications', email);
    cy.findByRole('button', { name: 'Save email' }).click();
  }
}

export default NotificationsSettings;
