import InvitationPage from 'page-objects/invitation.page';
import SearchEventPage from 'page-objects/search.page';
import SpeakerTalkPage from 'page-objects/speaker/talk.page';

describe('Talk invitation page', () => {
  beforeEach(() => cy.task('seedDB', 'invitation/talk-invite'));
  afterEach(() => cy.task('disconnectDB'));

  const invitation = new InvitationPage();
  const talk = new SpeakerTalkPage();
  const search = new SearchEventPage();

  it('can accept an invite to a talk', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    cy.assertText('Invitation sent by Clark Kent');
    cy.assertText('You have been invited to');
    cy.assertText('"Awesome talk"');
    invitation.acceptInvite().click();
    talk.isPageVisible();
    cy.assertText('Awesome talk');
    talk.speakersBlock().within(() => {
      cy.assertText('Clark Kent');
      cy.assertText('Bruce Wayne');
    });
  });

  it('go back to homepage', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    invitation.goHomepage().click();
    search.isPageVisible();
  });

  it('display error page when invitation not found', () => {
    cy.login('Bruce Wayne');
    cy.visit('/invitation/invitation-X', { failOnStatusCode: false });
    cy.assertText('Invitation not found');
  });
});
