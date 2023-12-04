import DeliberationPage from 'page-objects/team/event-deliberation.page.ts';

describe('Deliberation page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-deliberation');
  });

  afterEach(() => cy.task('disconnectDB'));

  const page = new DeliberationPage();

  it('redirects to signin, when user is not connected', () => {
    cy.login('Clark Kent');
    page.visit('team-1', 'conference-1');

    page.totalProposals().should('contain', '5');
    page.totalAccepted().should('contain', '2');
    page.totalRejected().should('contain', '2');
    page.totalNotDeliberated().should('contain', '1');

    page.totalConfirmations().should('contain', '0');
    page.totalNoResponse().should('contain', '0');
    page.totalConfirmed().should('contain', '0');
    page.totalDeclined().should('contain', '0');

    const modalAccepted = page.announceAccepted();
    modalAccepted.confirm();
    page.isPageVisible();
    page.announceAcceptedCard().should('contain.text', 'All results published');

    const modalRejected = page.announceRejected();
    modalRejected.confirm();
    page.isPageVisible();
    page.announceRejectedCard().should('contain.text', 'All results published');
  });

  describe('as a team member', () => {
    it('has access to result announcements', () => {
      cy.login('Bruce Wayne');
      page.visit('team-1', 'conference-1');
    });
  });

  describe('as a team reviewer', () => {
    it('does not have access to result announcements', () => {
      cy.login('Peter Parker');
      cy.visitAndCheck(`/team/team-1/conference-1/deliberation`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
