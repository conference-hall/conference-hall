import ResultAnnouncementPage from 'page-objects/team/event-results-announcement.page.ts';

describe('Results annoucement page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/results-announcement');
  });

  afterEach(() => cy.task('disconnectDB'));

  const page = new ResultAnnouncementPage();

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
    page.announceAcceptedCard().should('contain.text', 'All results accounced');

    const modalRejected = page.announceRejected();
    modalRejected.confirm();
    page.isPageVisible();
    page.announceRejectedCard().should('contain.text', 'All results accounced');
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
      cy.visitAndCheck(`/team/team-1/conference-1/results`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
