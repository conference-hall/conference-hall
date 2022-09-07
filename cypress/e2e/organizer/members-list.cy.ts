import OrganizationMembersPage from 'page-objects/organizer-members.page';

describe('Organization members list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/members-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const members = new OrganizationMembersPage();

  describe('as a organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays organization members list', () => {
      members.visit('awesome-orga');
      members.list().should('have.length', 3);
    });

    it('can invite a new member', () => {
      members.visit('awesome-orga');
      members.generateInvite().should('exist');
    });

    it('can change a member role', () => {
      members.visit('awesome-orga');
      members.changeRoleButton('Clark Kent').should('not.exist');
      members.changeRoleButton('Peter Parker').should('exist');

      members.member('Bruce Wayne').assertText('member');
      members.changeRoleButton('Bruce Wayne').click();
      members.selectRoleToChange('Bruce Wayne', 'Owner');
      members.confirmChangeRole('Bruce Wayne');
      members.member('Bruce Wayne').parent().should('contain.text', 'owner');
    });

    it('can remove a member', () => {
      members.visit('awesome-orga');
      members.removeMemberButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Peter Parker').should('exist');

      members.member('Bruce Wayne').should('exist');
      members.removeMemberButton('Bruce Wayne').click();
      members.confirmRemoveMember('Bruce Wayne');
      members.member('Bruce Wayne').should('not.exist');
    });
  });

  describe('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('can access to the member list but cannot update them', () => {
      members.visit('awesome-orga');
      members.list().should('have.length', 3);

      members.changeRoleButton('Clark Kent').should('not.exist');
      members.changeRoleButton('Peter Parker').should('not.exist');
      members.changeRoleButton('Bruce Wayne').should('not.exist');

      members.removeMemberButton('Clark Kent').should('not.exist');
      members.removeMemberButton('Peter Parker').should('not.exist');
      members.removeMemberButton('Bruce Wayne').should('not.exist');
    });
  });

  describe('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to the list', () => {
      cy.visit('/organizer/awesome-orga/members');
      cy.assertText('Forbidden');
    });
  });
});
