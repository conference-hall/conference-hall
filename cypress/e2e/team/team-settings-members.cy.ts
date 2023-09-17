import TeamMembersPage from '../../page-objects/team/members-list.page.ts';

describe('Team members list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/team-settings-members');
  });

  afterEach(() => cy.task('disconnectDB'));

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

      members.member('Bruce Wayne').assertText('member');
      members.changeRoleButton('Bruce Wayne').click();
      members.selectRoleToChange('Bruce Wayne', 'Owner');
      members.confirmChangeRole('Bruce Wayne');
      cy.assertToast('Member role changed.');
      members.member('Bruce Wayne').parent().should('contain.text', 'owner');
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

    it('cannot access to members settings and is redirected to event page', () => {
      cy.visitAndCheck('/team/awesome-team/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });

  describe('as a team reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to members settings and is redirected to event page', () => {
      cy.visitAndCheck('/team/awesome-team/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
