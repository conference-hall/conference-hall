class OrganizationMembersPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}/members`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Organization members' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Members list' }).children();
  }

  member(name: string) {
    return this.list().contains(name);
  }

  generateInvite() {
    cy.findByRole('button', { name: 'Invite member' }).click();
    cy.findByRole('button', { name: 'Generate invitation link' }).click();
    return cy.findByLabelText('Copy invitation link');
  }

  changeRoleButton(name: string) {
    return cy.findByRole('list', { name: 'Members list' }).findByLabelText(`Change role of ${name}`);
  }

  selectRoleToChange(name: string, role: string) {
    cy.findByRole('dialog', { name: `Change the role of ${name}?` })
      .findByRole('radio', { name: role })
      .click();
  }

  confirmChangeRole(name: string) {
    cy.findByRole('dialog', { name: `Change the role of ${name}?` })
      .findByRole('button', { name: `Change ${name}'s role` })
      .click();
  }

  removeMemberButton(name: string) {
    return cy.findByRole('list', { name: 'Members list' }).findByLabelText(`Remove ${name} from organization`);
  }

  confirmRemoveMember(name: string) {
    return cy
      .findByRole('dialog', { name: `Remove ${name} from the organization?` })
      .findByRole('button', { name: `Remove ${name}` })
      .click();
  }
}

export default OrganizationMembersPage;
