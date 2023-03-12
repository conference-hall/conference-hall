class InvitationPage {
  visit(inviteId: string) {
    cy.visit(`/invitation/${inviteId}`, { failOnStatusCode: false });
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
