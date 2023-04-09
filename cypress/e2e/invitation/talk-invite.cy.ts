import InvitationPage from 'page-objects/invitation.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';

describe('Talk invitation page', () => {
  beforeEach(() => cy.task('seedDB', 'invitation/talk-invite'));
  afterEach(() => cy.task('disconnectDB'));

  const invitation = new InvitationPage();
  const talk = new SpeakerTalkPage();

  it('can accept an invite to a talk', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    cy.assertText('Invitation sent by Clark Kent');
    cy.assertText('You have been invited to');
    cy.assertText('"Awesome talk"');
    invitation.acceptInvite().click();
    talk.isPageVisible();
    cy.assertText('Awesome talk');
    cy.assertText('by Clark Kent, Bruce Wayne');
  });

  it('display error page when invitation not found', () => {
    cy.login('Bruce Wayne');
    cy.visit('/invitation/invitation-X', { failOnStatusCode: false });
    cy.assertText('Invitation not found');
  });
});
