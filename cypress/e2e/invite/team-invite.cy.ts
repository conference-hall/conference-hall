import InvitationPage from '../../page-objects/invitation.page.ts';
import TeamHomePage from '../../page-objects/team/team-home.page.ts';

describe('Invite to team', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/team-invite');
  });

  const invite = new InvitationPage();
  const team = new TeamHomePage();

  it('accepts team invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('team', '123');
    cy.findByText('Awesome team').should('exist');

    invite.acceptInvite();
    team.isPageVisible();
  });
});
