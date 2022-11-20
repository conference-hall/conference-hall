import InvitationPage from 'page-objects/invitation.page';
import OrganizationEventsPage from 'page-objects/organizer/events-list.page';
import SearchEventPage from 'page-objects/search.page';

describe('Organization invitation page', () => {
  beforeEach(() => cy.task('seedDB', 'invitation/organization-invite'));
  afterEach(() => cy.task('disconnectDB'));

  const invitation = new InvitationPage();
  const organization = new OrganizationEventsPage();
  const search = new SearchEventPage();

  it('can accept an invite to an organization', () => {
    cy.login('Bruce Wayne');
    invitation.visit('invitation-1');
    cy.assertText('Invitation sent by Clark Kent');
    cy.assertText('You have been invited to');
    cy.assertText('"Awesome organization"');
    invitation.acceptInvite().click();
    organization.isPageVisible();
    cy.assertText('Awesome organization');
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
