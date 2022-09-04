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

    it.skip('can invite a new member', () => {
      members.visit('awesome-orga');
    });

    it.skip('can change a member role', () => {
      members.visit('awesome-orga');
    });

    it.skip('can remove a member', () => {
      members.visit('awesome-orga');
    });
  });

  describe.skip('as a organization member', () => {
    beforeEach(() => cy.login('Bruce Wayne'));

    it('can access to the member list', () => {
      members.visit('awesome-orga');
    });
  });

  describe.skip('as a organization reviewer', () => {
    beforeEach(() => cy.login('Peter Parker'));

    it('cannot access to the list', () => {
      members.visit('awesome-orga');
    });
  });
});
