import BasePage from '../../page-objects/base.page.ts';

class TeamRequestAccessPage extends BasePage {
  visit() {
    cy.visitAndCheck('/team/request');
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Become event organizer.' }).should('exist');
  }

  fillAccessKey(key: string) {
    return cy.typeOn('Beta access key', key);
  }

  clickGetAccess() {
    cy.findByRole('button', { name: 'Get access' }).click();
  }
}

export default TeamRequestAccessPage;
