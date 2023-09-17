import BasePage from './base.page.ts';

class NotificationsPage extends BasePage {
  visit() {
    cy.visitAndCheck('/notifications');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Notifications' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Notifications list' }).children();
  }

  notification(name: string) {
    return this.list().contains(name);
  }
}

export default NotificationsPage;
