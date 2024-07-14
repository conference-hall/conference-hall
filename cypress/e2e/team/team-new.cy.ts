import TeamHomePage from '../../page-objects/team/team-home.page.ts';
import TeamNewPage from '../../page-objects/team/team-new.page.ts';

describe('Team create', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-new');
  });

  afterEach(() => cy.task('disconnectDB'));

  const teamNew = new TeamNewPage();
  const team = new TeamHomePage();

  it('can create a new team', () => {
    cy.login();
    teamNew.visit();
    teamNew.isPageVisible();

    teamNew.fillForm({ name: 'Hello world' });
    cy.assertInputText('Team URL', 'hello-world');
    teamNew.newTeam().click();

    team.isPageVisible();
    cy.assertText('Hello world');
  });

  it('cannot create an team when slug already exists', () => {
    cy.login();
    teamNew.visit();
    teamNew.isPageVisible();

    teamNew.fillForm({ name: 'team 1' });
    cy.assertInputText('Team URL', 'team-1');
    teamNew.newTeam().click();
    teamNew.error('Team URL').should('contains.text', 'This URL already exists, please try another one.');
  });
});
