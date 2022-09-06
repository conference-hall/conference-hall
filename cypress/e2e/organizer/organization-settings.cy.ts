import OrganizationSettingsPage from 'page-objects/organizer-orga-settings.page';

describe('Organization settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organization-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const settings = new OrganizationSettingsPage();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('updates the organization settings', () => {
      settings.visit('awesome-orga');
      settings.fillSettingsForm({ name: 'Awesome orga updated', slug: 'awesome-orga-updated' });
      settings.saveAbstract().click();
      cy.assertInputText('Name', 'Awesome orga updated');
      cy.assertInputText('Slug', 'awesome-orga-updated');
      cy.assertUrl('/organizer/awesome-orga-updated/settings');
    });

    it('displays error messages', () => {
      settings.visit('awesome-orga');
      settings.fillSettingsForm({ name: 'Awesome orga updated', slug: '!@#$%^' });
      settings.saveAbstract().click();
      settings.error('Slug').should('contain.text', 'Must only contain lower case alphanumeric and dashes (-).');
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot access to the organization settings page', () => {
      cy.visit('/organizer/awesome-orga/settings');
      cy.assertText('Forbidden');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to the organization settings page', () => {
      cy.visit('/organizer/awesome-orga/settings');
      cy.assertText('Forbidden');
    });
  });
});
