import OrganizationPage from 'page-objects/organizer-organization.page';
import OrganizationsPage from 'page-objects/organizer-organizations.page';

describe('Organizations page list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizations-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organizations = new OrganizationsPage();
  const organization = new OrganizationPage();

  it('displays organization list when user has severals organizations', () => {
    cy.login();
    organizations.visit();
    organizations.list().should('have.length', 3);
    organizations.newOrganization().should('exist');
    organizations.organization('Awesome orga 2').click();
    organization.isPageVisible();
    cy.assertText('Awesome orga 2');
  });
});
