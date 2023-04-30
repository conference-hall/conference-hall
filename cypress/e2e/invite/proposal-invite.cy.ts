import EventProposalPage from 'page-objects/event/proposal.page';
import InvitationPage from 'page-objects/invitation.page';

describe('Invite to proposal', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/proposal-invite');
  });

  afterEach(() => cy.task('disconnectDB'));

  const invite = new InvitationPage();
  const proposal = new EventProposalPage();

  it('accepts proposal invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('proposal', '123');
    cy.findByRole('heading', { name: 'Awesome talk' }).should('exist');

    invite.acceptInvite();
    proposal.isPageVisible();
  });
});
