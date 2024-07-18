import TeamNewPage from 'page-objects/team/team-new.page.ts';
import TeamRequestAccessPage from 'page-objects/team/team-request-access.page.ts';

describe('Team page access and redirections', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-access');
  });

  afterEach(() => cy.task('disconnectDB'));

  const requestPage = new TeamRequestAccessPage();
  const newTeamPage = new TeamNewPage();

  it('get access with a beta access key', () => {
    cy.login('Bruce Wayne');

    requestPage.visit();

    // Check request access link
    cy.findByRole('link', { name: 'Request a beta access key' }).should(
      'have.attr',
      'href',
      'https://forms.gle/AnArRCSHibmG59zw7',
    );

    // Invalid key
    requestPage.fillAccessKey('123');
    requestPage.clickGetAccess();
    requestPage.inputError('Beta access key').should('contain.text', 'Invalid access key');

    // Valid key
    requestPage.fillAccessKey('123456');
    requestPage.clickGetAccess();

    newTeamPage.isPageVisible();
  });
});
