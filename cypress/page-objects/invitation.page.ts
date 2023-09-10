import BasePage from './base.page';

class InvitationPage extends BasePage {
  visit(type: string, code: string) {
    cy.visitAndCheck(`/invite/${type}/${code}`, { failOnStatusCode: false });
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('button', { name: 'Accept invitation' }).should('exist');
  }

  acceptInvite() {
    cy.findByRole('button', { name: 'Accept invitation' }).click();
  }
}

export default InvitationPage;
