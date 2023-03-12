import EventProposalPage from 'page-objects/event/proposal.page';
import InvitationPage from 'page-objects/invitation.page';

describe('Proposal invitation page', () => {
  beforeEach(() => cy.task('seedDB', 'invitation/proposal-invite'));
  afterEach(() => cy.task('disconnectDB'));

  const invitation = new InvitationPage();
  const proposal = new EventProposalPage();

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

  it('display error page when invitation not found', () => {
    cy.login('Bruce Wayne');
    cy.visit('/invitation/invitation-X', { failOnStatusCode: false });
    cy.assertText('Invitation not found');
  });
});
