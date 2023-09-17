import ProposalReviewPage from '../../page-objects/team/event-proposal-review.page.ts';
import OrganizationEventsProposalsPage from '../../page-objects/team/event-proposals-list.page.ts';

describe('Event proposals list', () => {
  beforeEach(() => {
    cy.task('seedDB', 'team/event-proposals-list');
  });

  afterEach(() => cy.task('disconnectDB'));

  const proposals = new OrganizationEventsProposalsPage();
  const review = new ProposalReviewPage();

  describe('Displays proposals', () => {
    it('displays all proposals of the event', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');

      cy.assertText('3 proposals');
      proposals.proposal('Talk 1').should('exist');
      proposals.proposal('Talk 2').should('exist');
      proposals.proposal('Talk 3').should('exist');
    });

    it('opens proposal review page', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');

      cy.assertText('3 proposals');
      proposals.proposal('Talk 1').click();

      review.isPageVisible();
      cy.assertText('Talk 1');
    });
  });

  describe('Filters proposals', () => {
    it('filters by title', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterSearch().type('Talk 1{enter}');

      cy.assertText('1 proposals');
      cy.assertUrl('query=Talk+1');
      proposals.proposal('Talk 1').should('exist');
      proposals.proposal('Talk 2').should('not.exist');
      proposals.proposal('Talk 3').should('not.exist');
    });

    it('clears filters', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterSearch().type('Talk 1{enter}');

      cy.assertText('1 proposals');
      proposals.clearFilters();
      cy.assertText('3 proposals');
    });

    it('filters by speaker names', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterSearch().type('Robin{enter}');

      cy.assertText('2 proposals');
      cy.assertUrl('query=Robin');
      proposals.proposal('Talk 1').should('not.exist');
      proposals.proposal('Talk 2').should('exist');
      proposals.proposal('Talk 3').should('exist');
    });

    it('filters by reviews', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterReviews('Reviewed');

      cy.assertText('1 proposals');
      proposals.proposal('Talk 1').should('exist');
      proposals.proposal('Talk 2').should('not.exist');
      proposals.proposal('Talk 3').should('not.exist');
    });

    it('filters by statuses', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterStatus('Accepted');

      cy.assertText('1 proposals');
      cy.assertUrl('status=ACCEPTED');
      proposals.proposal('Talk 1').should('not.exist');
      proposals.proposal('Talk 2').should('exist');
      proposals.proposal('Talk 3').should('not.exist');
    });

    it('filters by formats', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterFormat('Format 1');

      cy.assertText('1 proposals');
      cy.assertUrl('formats=');
      proposals.proposal('Talk 1').should('exist');
      proposals.proposal('Talk 2').should('not.exist');
      proposals.proposal('Talk 3').should('not.exist');
    });

    it('filters by categories', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.filterCategory('Category 1');

      cy.assertText('1 proposals');
      cy.assertUrl('categories=');
      proposals.proposal('Talk 1').should('exist');
      proposals.proposal('Talk 2').should('not.exist');
      proposals.proposal('Talk 3').should('not.exist');
    });

    it('sorts by oldest', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.sortBy('Oldest');

      cy.assertText('3 proposals');
      cy.assertUrl('sort=oldest');
    });
  });

  describe('Actions on proposals', () => {
    it('marks selected proposals as accepted', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.selectProposal('Talk 1').click();
      proposals.selectProposal('Talk 3').click();
      cy.assertText('2 selected');
      proposals.markAs('Accepted proposal(s)');
      cy.assertToast('2 proposals marked as "accepted".');
    });

    it('marks selected proposals as rejected', () => {
      cy.login('Clark Kent');
      proposals.visit('team-1', 'conference-1');
      proposals.selectProposal('Talk 1').click();
      proposals.selectProposal('Talk 3').click();
      cy.assertText('2 selected');
      proposals.markAs('Rejected proposal(s)');
      cy.assertToast('2 proposals marked as "rejected".');
    });
  });
});
