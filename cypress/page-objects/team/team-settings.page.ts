import BasePage from '../../page-objects/base.page.ts';

type SettingsFormType = { name?: string; slug?: string };

class TeamSettingsPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/team/${slug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Team settings' }).should('exist');
  }

  fillSettingsForm(data: SettingsFormType) {
    if (data.name) cy.typeOn('Team name', data.name);
    if (data.slug) cy.typeOn('Team URL', data.slug);
  }

  saveAbstract() {
    return cy.findByRole('button', { name: 'Save' });
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-describe`);
      });
  }
}

export default TeamSettingsPage;
