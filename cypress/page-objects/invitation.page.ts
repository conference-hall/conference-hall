class InvitationPage {
  visit(type: string, code: string) {
    cy.visit(`/invite/${type}/${code}`, { failOnStatusCode: false });
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('button', { name: 'Accept invitation' }).should('exist');
  }

  acceptInvite() {
    return cy.findByRole('button', { name: 'Accept invitation' });
  }
}

export default InvitationPage;
