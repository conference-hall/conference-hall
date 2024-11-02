import PublicationPage from 'page-objects/team/event-publication.page.ts';

describe('Publication page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-publication');
  });

  const page = new PublicationPage();

  it('checks statistics and publish results', () => {
    cy.login('Clark Kent');
    page.visit('team-1', 'conference-1');

    page.dashboardCard('Total results published').within(() => {
      cy.assertText('2 / 4');
      page.cardActionLink(/See all proposals/).should('have.attr', 'href', '/team/team-1/conference-1/reviews');
    });

    page.dashboardCard('Accepted proposals to publish').within(() => {
      cy.assertText('1');
    });
    const acceptedModal = page.publish(/Publish all "Accepted"/);
    page.dashboardCard('Results to publish').within(() => {
      cy.assertText('1');
    });
    acceptedModal.confirm();
    page.dashboardCard('Accepted proposals to publish').within(() => {
      cy.assertText('0');
    });

    page.dashboardCard('Total results published').within(() => {
      cy.assertText('3 / 4');
    });

    page.dashboardCard('Rejected proposals to publish').within(() => {
      cy.assertText('1');
    });
    const rejectedModal = page.publish(/Publish all "Rejected"/);
    page.dashboardCard('Results to publish').within(() => {
      cy.assertText('1');
    });
    rejectedModal.confirm();
    page.dashboardCard('Rejected proposals to publish').within(() => {
      cy.assertText('0');
    });

    page.dashboardCard('Total results published').within(() => {
      cy.assertText('4 / 4');
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
      cy.visitAndCheck('/team/team-1/conference-1/publication', { failOnStatusCode: false });
      page.assertForbiddenPage();
    });
  });
});
