import BasePage from './base.page';

class NotificationsPage extends BasePage {
  visit() {
    cy.visit('/notifications');
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
