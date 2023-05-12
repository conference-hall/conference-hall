import OrganizationMembersPage from 'page-objects/organizer/members-list.page';

describe('Organization members list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/organization-settings-members');
  });

  afterEach(() => cy.task('disconnectDB'));

  const members = new OrganizationMembersPage();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays organization members list', () => {
      members.visit('awesome-orga');
      members.list().should('have.length', 3);
      members.findMember().type('bru{enter}');
      members.list().should('have.length', 1);
    });

    it('can invite a new member', () => {
      members.visit('awesome-orga');
      members.memberInvite().should('exist');
    });

    it('can change a member role', () => {
      members.visit('awesome-orga');
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
      members.visit('awesome-orga');
      members.removeMemberButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Peter Parker').should('exist');

      members.member('Bruce Wayne').should('exist');
      members.removeMemberButton('Bruce Wayne').click();
      members.confirmRemoveMember('Bruce Wayne');
      cy.assertToast('Member removed from organization.');
      members.member('Bruce Wayne').should('not.exist');
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('cannot access to members settings and is redirected to event page', () => {
      cy.visit('/organizer/awesome-orga/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to members settings and is redirected to event page', () => {
      cy.visit('/organizer/awesome-orga/settings/members', { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
