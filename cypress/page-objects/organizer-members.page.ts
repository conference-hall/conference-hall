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

  changeRoleButton(name: string) {
    return cy.findByRole('list', { name: 'Members list' }).findByLabelText(`Change role of ${name}`);
  }

  selectRoleToChange(name: string, role: string) {
    return cy.findByRole('dialog', { name: `Change the role of ${name}?` }).clickOn(role);
  }

  confirmChangeRole(name: string) {
    return cy.findByRole('dialog', { name: `Change the role of ${name}?` }).clickOn(`Change ${name}'s role`);
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
