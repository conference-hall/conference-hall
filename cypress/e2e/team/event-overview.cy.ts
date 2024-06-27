import ProposalOverview from 'page-objects/team/event-overview.page.ts';

describe('Event overview', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-overview');
  });

  afterEach(() => cy.task('disconnectDB'));

  const overview = new ProposalOverview();

  describe('Displays event overview', () => {
    it('displays all dashboard cards', () => {
      cy.login('Clark Kent');
      overview.visit('team-1', 'conference-1');

      overview.dashboardCard('Call for paper open').within(() => {
        overview.cardActionLink('Change').should('have.attr', 'href', '/team/team-1/conference-1/settings/cfp');
      });

      overview.dashboardCard('The event is public').within(() => {
        overview.cardActionLink('Change').should('have.attr', 'href', '/team/team-1/conference-1/settings');
      });

      overview.dashboardCard('Reviews are enabled').within(() => {
        overview.cardActionLink('Change').should('have.attr', 'href', '/team/team-1/conference-1/settings/review');
      });

      overview.dashboardCard('Proposals').within(() => {
        cy.assertText('3');
      });

      overview.dashboardCard('Speakers').within(() => {
        cy.assertText('2');
      });

      overview.dashboardCard('Proposals reviewed by you.').within(() => {
        cy.assertText('67%');
        cy.assertText('2 / 3');
      });

      overview.dashboardCard('Proposals by formats').within(() => {
        overview.cardActionLink('Format 1').should('have.attr', 'href', '/team/team-1/conference-1/reviews?formats=f1');
        overview.cardActionLink('Format 2').should('have.attr', 'href', '/team/team-1/conference-1/reviews?formats=f2');
      });

      overview.dashboardCard('Proposals by categories').within(() => {
        overview
          .cardActionLink('Category 1')
          .should('have.attr', 'href', '/team/team-1/conference-1/reviews?categories=c1');
        overview
          .cardActionLink('Category 2')
          .should('have.attr', 'href', '/team/team-1/conference-1/reviews?categories=c2');
      });
    });

    it('displays dashboard cards for a reviewer on a simple event', () => {
      cy.login('Bruce Wayne');
      overview.visit('team-1', 'conference-2');

      overview.dashboardCard('Call for paper closed').within(() => {
        overview.cardActionLink('Change').should('not.exist');
      });

      overview.dashboardCard('The event is private').within(() => {
        overview.cardActionLink('Change').should('not.exist');
      });

      overview.dashboardCard('Reviews are disabled').within(() => {
        overview.cardActionLink('Change').should('not.exist');
      });

      overview.dashboardCard('Proposals').within(() => {
        cy.assertText('0');
      });

      overview.dashboardCard('Speakers').within(() => {
        cy.assertText('0');
      });

      overview.dashboardCard('Proposals reviewed by you.').within(() => {
        cy.assertText('0%');
        cy.assertText('0 / 0');
      });

      overview.dashboardCard('Proposals by formats').should('not.exist');
      overview.dashboardCard('Proposals by categories').should('not.exist');
    });
  });
});
