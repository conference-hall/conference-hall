import SpeakerHomePage from 'page-objects/speaker/home.page.ts';
import TeamSettingsPage from '../../page-objects/team/team-settings.page.ts';

describe('Team settings', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-settings');
  });

  afterEach(() => cy.task('disconnectDB'));

  const settings = new TeamSettingsPage();
  const homepage = new SpeakerHomePage();

  describe('as a team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('can edit the team but cannot leave the team', () => {
      settings.visit('awesome-team');

      cy.findByRole('heading', { name: 'General' }).should('exist');
      cy.findByRole('heading', { name: 'Leave the "Awesome team" team' }).should('not.exist');

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
      settings
        .inputError('Team URL')
        .should('contain.text', 'Must only contain lower case alphanumeric and dashes (-).');
    });
  });

  describe('as a team member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot edit the team but can leave the team', () => {
      settings.visit('awesome-team');
      cy.findByRole('heading', { name: 'General' }).should('not.exist');
      cy.findByRole('heading', { name: 'Leave the "Awesome team" team' }).should('exist');

      settings.leaveTeam('Awesome team').click();
      homepage.isPageVisible();
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot edit the team but can leave the team', () => {
      settings.visit('awesome-team');
      cy.findByRole('heading', { name: 'General' }).should('not.exist');
      cy.findByRole('heading', { name: 'Leave the "Awesome team" team' }).should('exist');

      settings.leaveTeam('Awesome team').click();
      homepage.isPageVisible();
    });
  });
});
