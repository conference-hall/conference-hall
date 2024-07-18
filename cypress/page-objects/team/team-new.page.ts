import BasePage from '../../page-objects/base.page.ts';

type TeamNewType = {
  name?: string;
  slug?: string;
};

class TeamNewPage extends BasePage {
  visit() {
    cy.visitAndCheck(`/team/new`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Create a new team.' }).should('exist');
  }

  fillForm(data: TeamNewType) {
    if (data.name) cy.typeOn('Team name', data.name);
    if (data.slug) cy.typeOn('Team URL', data.slug);
  }

  newTeam() {
    return cy.findByRole('button', { name: 'Create team' });
  }
}

export default TeamNewPage;
