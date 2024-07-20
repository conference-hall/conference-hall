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

    page.dashboardCard('Total results published').within(() => {
      cy.assertText('2');
      page.cardActionLink(/See all proposals/).should('have.attr', 'href', '/team/team-1/conference-1/reviews');
    });

    page.dashboardCard('Accepted published').within(() => {
      cy.assertText('1 / 2');
    });

    const accepted = page.publish(/Publish "Accepted"/);
    page.dashboardCard('Results to publish').within(() => {
      cy.assertText('1');
    });
    accepted.confirm();
    page.dashboardCard('Accepted published').within(() => {
      cy.assertText('2 / 2');
    });

    const rejected = page.publish(/Publish "Rejected"/);
    page.dashboardCard('Results to publish').within(() => {
      cy.assertText('1');
    });
    rejected.confirm();
    page.dashboardCard('Rejected published').within(() => {
      cy.assertText('2 / 2');
    });
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
      page.assertForbiddenPage();
    });
  });
});
