class InvitationPage {
  visit(inviteCode: string) {
    cy.visit(`/invitation/${inviteCode}`, { failOnStatusCode: false });
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
