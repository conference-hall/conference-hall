import InvitationPage from 'page-objects/invitation.page';
import TeamEventsPage from 'page-objects/team/events-list.page';

describe('Invite to team', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/team-invite');
  });

  afterEach(() => cy.task('disconnectDB'));

  const invite = new InvitationPage();
  const team = new TeamEventsPage();

  it('accepts team invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('team', '123');
    cy.findByRole('heading', { name: 'Awesome team' }).should('exist');

    invite.acceptInvite();
    team.isPageVisible();
  });
});
