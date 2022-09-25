import OrganizationEventsPage from 'page-objects/organizer-events.page';
import OrganizationsPage from 'page-objects/organizer-organizations.page';
import OrganizationNewPage from 'page-objects/organizer-orga-new.page';

describe('Organizations page list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organizations-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const organizations = new OrganizationsPage();
  const organization = new OrganizationEventsPage();
  const organizationNew = new OrganizationNewPage();

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
    organizationNew.isPageVisible();

    organizationNew.fillForm({ name: 'Hello world' });
    cy.assertInputText('Organization slug', 'hello-world');
    organizationNew.newOrganization().click();

    organization.isPageVisible();
    cy.assertText('Hello world');
  });

  it('cannot create an organization when slug already exists', () => {
    cy.login();
    organizations.visit();
    organizations.newOrganization().click();
    organizationNew.isPageVisible();

    organizationNew.fillForm({ name: 'orga 1' });
    cy.assertInputText('Organization slug', 'orga-1');
    organizationNew.newOrganization().click();
    organizationNew.error('Organization slug').should('contains.text', 'Slug already exists, please try another one.');
  });
});
