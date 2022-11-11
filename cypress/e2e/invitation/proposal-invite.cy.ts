import EventProposalPage from 'page-objects/event/proposal.page';
import InvitationPage from 'page-objects/invitation.page';
import SearchEventPage from 'page-objects/search.page';

describe('Proposal invitation page', () => {
  beforeEach(() => cy.task('seedDB', 'invitation/proposal-invite'));
  afterEach(() => cy.task('disconnectDB'));

  const invitation = new InvitationPage();
  const proposal = new EventProposalPage();
  const search = new SearchEventPage();

  it('can accept an invite to a proposal', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    cy.assertText('Invitation sent by Clark Kent');
    cy.assertText('You have been invited to');
    cy.assertText('"Awesome talk"');
    invitation.acceptInvite().click();
    proposal.isPageVisible();
    cy.assertText('Proposal "Awesome talk"');
    cy.assertText('Clark Kent');
    cy.assertText('Bruce Wayne');
  });

  it('go back to homepage', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    invitation.goHomepage().click();
    search.isPageVisible();
  });

  it('display error page when invitation not found', () => {
    cy.login('Bruce Wayne');
    cy.visit('/invitation/invitation-X');
    cy.assertText('Invitation not found');
  });
});
