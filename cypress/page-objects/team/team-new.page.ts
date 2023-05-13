import BasePage from 'page-objects/base.page';

type TeamNewType = {
  name?: string;
  slug?: string;
};

class TeamNewPage extends BasePage {
  visit() {
    cy.visit(`/team`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Create a new team' }).should('exist');
  }

  fillForm(data: TeamNewType) {
    if (data.name) cy.typeOn('Team name', data.name);
    if (data.slug) cy.typeOn('Team URL', data.slug);
  }

  newTeam() {
    return cy.findByRole('button', { name: 'New team' });
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }
}

export default TeamNewPage;