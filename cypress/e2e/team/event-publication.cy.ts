import PublicationPage from 'page-objects/team/event-publication.page.ts';

describe('Publication page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-publication');
  });

  afterEach(() => cy.task('disconnectDB'));

  const page = new PublicationPage();

  it('checks statistics and publish results', () => {
    cy.login('Clark Kent');
    page.visit('team-1', 'conference-1');

    // TODO: add tests on links to proposals list page
    page.totalProposals().should('contain', '5');
    page.totalAccepted().should('contain', '2');
    page.totalRejected().should('contain', '2');
    page.totalNotDeliberated().should('contain', '1');

    page.totalConfirmations().should('contain', '1');
    page.totalNoResponse().should('contain', '1');
    page.totalConfirmed().should('contain', '0');
    page.totalDeclined().should('contain', '0');

    const modalAccepted = page.publishAccepted();
    modalAccepted.confirm();
    page.isPageVisible();
    page.publishAcceptedCard().should('contain.text', 'All results published');
    page.totalConfirmations().should('contain', '2');
    page.totalNoResponse().should('contain', '2');

    const modalRejected = page.publishRejected();
    modalRejected.confirm();
    page.isPageVisible();
    page.publishRejectedCard().should('contain.text', 'All results published');
  });

  describe('as a team member', () => {
    it('has access to publication', () => {
      cy.login('Bruce Wayne');
      page.visit('team-1', 'conference-1');
    });
  });

  describe('as a team reviewer', () => {
    it('does not have access to publication', () => {
      cy.login('Peter Parker');
      cy.visitAndCheck(`/team/team-1/conference-1/publication`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
