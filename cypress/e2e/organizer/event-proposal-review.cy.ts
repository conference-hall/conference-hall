import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';
import OrganizationEventsProposalsPage from 'page-objects/organizer/event-proposals-list.page';

describe('Organizer proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/event-proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();
  const proposals = new OrganizationEventsProposalsPage();

  describe('as organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays proposal data', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');

      review.title('Talk 1').should('exist');
      cy.assertText('Advanced');
      cy.assertText('French');
      cy.assertText('Talk description');
      cy.assertText('Talk references');
      cy.assertText('Format 1');
      cy.assertText('Category 1');
      cy.assertText('Marie Jane');
    });

    it('navigates between proposals', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      cy.assertText('2 / 2');
      review.nextProposal();
      review.title('Talk 2').should('exist');
      cy.assertText('1 / 2');
      review.nextProposal();
      review.title('Talk 1').should('exist');
      cy.assertText('2 / 2');
      review.previousProposal();
      review.title('Talk 2').should('exist');
      cy.assertText('1 / 2');
    });

    it('exits the proposal review page', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      review.closePage();
      proposals.isPageVisible();
    });
  });
});
