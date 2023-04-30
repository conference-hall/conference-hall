import InvitationPage from 'page-objects/invitation.page';
import OrganizationEventsPage from 'page-objects/organizer/events-list.page';

describe('Invite to organization', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/organization-invite');
  });

  afterEach(() => cy.task('disconnectDB'));

  const invite = new InvitationPage();
  const orga = new OrganizationEventsPage();

  it('accepts organization invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('orga', '123');
    cy.findByRole('heading', { name: 'Awesome orga' }).should('exist');

    invite.acceptInvite();
    orga.isPageVisible();
  });
});
