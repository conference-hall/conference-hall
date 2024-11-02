import TeamMembersPage from '../../page-objects/team/members-list.page.ts';

describe('Team members list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-settings-members');
  });

  const members = new TeamMembersPage();

  describe('as a team owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays team members list', () => {
      members.visit('awesome-team');
      members.list().should('have.length', 3);
      members.findMember().type('bru{enter}');
      members.list().should('have.length', 1);
    });

    it('can invite a new member', () => {
      members.visit('awesome-team');
      members.memberInvite().should('exist');
    });

    it('can change a member role', () => {
      members.visit('awesome-team');
      members.changeRoleButton('Clark Kent').should('not.exist');
      members.changeRoleButton('Peter Parker').should('exist');

      members.member('Bruce Wayne').assertText('Member');

      members.changeRoleButton('Bruce Wayne').click();
      members.selectRoleToChange('Bruce Wayne', 'Owner');
      members.confirmChangeRole('Bruce Wayne');

      cy.assertToast('Member role changed.');
      members.member('Bruce Wayne').parent().should('contain.text', 'Owner');
    });

    it('can remove a member', () => {
      members.visit('awesome-team');
      members.removeMemberButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Peter Parker').should('exist');

      members.member('Bruce Wayne').should('exist');
      members.removeMemberButton('Bruce Wayne').click();
      members.confirmRemoveMember('Bruce Wayne');
      cy.assertToast('Member removed from team.');
      members.member('Bruce Wayne').should('not.exist');
    });
  });

  describe('as a team member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('can access to members settings but without edit permissions', () => {
      members.visit('awesome-team');

      members.list().should('have.length', 3);

      members.changeRoleButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Clark Kent').should('not.exist');

      members.changeRoleButton('Bruce Wayne').should('not.exist');
      members.removeMemberButton('Bruce Wayne').should('not.exist');

      members.changeRoleButton('Peter Parker').should('not.exist');
      members.removeMemberButton('Peter Parker').should('not.exist');
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('can access to members settings but without edit permissions', () => {
      members.visit('awesome-team');

      members.list().should('have.length', 3);

      members.changeRoleButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Clark Kent').should('not.exist');

      members.changeRoleButton('Bruce Wayne').should('not.exist');
      members.removeMemberButton('Bruce Wayne').should('not.exist');

      members.changeRoleButton('Peter Parker').should('not.exist');
      members.removeMemberButton('Peter Parker').should('not.exist');
    });
  });
});
