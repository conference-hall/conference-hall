import OrganizationEventsPage from 'page-objects/organizer-events.page';
import OrganizationsPage from 'page-objects/organizer-organizations.page';

describe('Organizations page list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizations-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organizations = new OrganizationsPage();
  const organization = new OrganizationEventsPage();

  it('displays organization list when user has severals organizations', () => {
    cy.login();
    organizations.visit();
    organizations.list().should('have.length', 3);
    organizations.newOrganization().should('exist');
    organizations.organization('Awesome orga 2').click();
    organization.isPageVisible();
    cy.assertText('Awesome orga 2');
  });

  it('can create a new organization', () => {
    cy.login();
    organizations.visit();
    organizations.newOrganization().click();
    cy.assertText('Create a new organization');
  });
});
