import InvitationPage from 'page-objects/invitation.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';

describe('Invite to talk', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/talk-invite');
  });

  afterEach(() => cy.task('disconnectDB'));

  const invite = new InvitationPage();
  const talk = new SpeakerTalkPage();

  it('accepts talk invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('talk', '123');
    cy.findByRole('heading', { name: 'Awesome talk' }).should('exist');

    invite.acceptInvite();
    talk.isPageVisible();
  });
});
