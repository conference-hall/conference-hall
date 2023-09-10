import TeamSettingsPage from 'page-objects/team/team-settings.page';

describe('Team settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const settings = new TeamSettingsPage();

  describe('as a team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('updates the team settings', () => {
      settings.visit('awesome-team');
      settings.fillSettingsForm({ name: 'Awesome team updated', slug: 'awesome-team-updated' });
      settings.saveAbstract().click();
      cy.assertToast('Team settings saved.');

      cy.assertInputText('Team name', 'Awesome team updated');
      cy.assertInputText('Team URL', 'awesome-team-updated');
      cy.assertUrl('/team/awesome-team-updated/settings');
    });

    it('displays error messages', () => {
      settings.visit('awesome-team');
      settings.fillSettingsForm({ name: 'Awesome team updated', slug: '!@#$%^' });
      settings.saveAbstract().click();
      settings.error('Team URL').should('contain.text', 'Must only contain lower case alphanumeric and dashes (-).');
    });
  });

  describe('as a team member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot access to the team settings page', () => {
      cy.visitAndCheck('/team/awesome-team/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to the team settings page', () => {
      cy.visitAndCheck('/team/awesome-team/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
