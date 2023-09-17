import BasePage from '../../page-objects/base.page.ts';

class TeamMembersPage extends BasePage {
  visit(slug: string) {
    cy.visitAndCheck(`/team/${slug}/settings/members`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Members' }).should('exist');
  }

  list() {
    return cy.findByRole('list', { name: 'Members list' }).children();
  }

  findMember() {
    return cy.findByLabelText('Find member');
  }

  member(name: string) {
    return this.list().contains(name);
  }

  memberInvite() {
    cy.findByRole('button', { name: 'Invite member' }).click();
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
    return cy.findByRole('list', { name: 'Members list' }).findByLabelText(`Remove ${name} from team`);
  }

  confirmRemoveMember(name: string) {
    return cy
      .findByRole('dialog', { name: `Remove ${name} from the team?` })
      .findByRole('button', { name: `Remove ${name}` })
      .click();
  }
}

export default TeamMembersPage;
