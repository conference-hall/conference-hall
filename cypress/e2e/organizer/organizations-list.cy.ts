import OrganizationsPage from 'page-objects/organizer-organizations';

describe('Organizations page list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizations-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organizations = new OrganizationsPage();

  it('displays organization list when user has severals organizations', () => {
    cy.login();
    organizations.visit();
    organizations.list().should('have.length', 3);
    organizations.newOrganization().should('exist');
  });
});
