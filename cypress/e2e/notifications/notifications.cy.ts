import EventProposalPage from '../../page-objects/event/proposal.page.ts';
import NotificationsPage from '../../page-objects/notifications.page.ts';

describe('Notifications', () => {
  beforeEach(() => {
    cy.task('seedDB', 'notifications/notifications');
  });

  const notifications = new NotificationsPage();
  const proposal = new EventProposalPage();

  it('displays the notifications page with notifications', () => {
    cy.login();
    notifications.visit();
    notifications.list().should('have.length', 2);
    notifications.notification('My talk 1').should('exist');
    notifications.notification('My talk 1').click();

    proposal.isPageVisible();
    cy.findByRole('heading', { name: 'My talk 1' }).should('exist');
  });

  it('displays the notifications page without notifications', () => {
    cy.login('Bruce Wayne');
    notifications.visit();
    cy.assertText('No notifications');
  });
});
