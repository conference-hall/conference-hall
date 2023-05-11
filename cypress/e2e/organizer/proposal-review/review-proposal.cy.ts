import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';
import OrganizationEventsProposalsPage from 'page-objects/organizer/event-proposals-list.page';

describe('Organizer proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();
  const proposals = new OrganizationEventsProposalsPage();

  describe('as organization owner', () => {
    beforeEach(() => cy.login('Clark Kent'));

    it('displays proposal data and review the proposal', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');

      review.title('Talk 1').should('exist');
      cy.assertText('Advanced');
      cy.assertText('French');
      cy.assertText('Talk description');
      cy.assertText('Talk references');
      cy.assertText('Format 1');
      cy.assertText('Category 1');
      cy.assertText('by Marie Jane, Robin');

      cy.findByLabelText('No way: 0').should('exist');
      cy.findByLabelText('Love it: 0').should('exist');
      cy.findByLabelText('Score: 3').should('exist');
      cy.findByLabelText('Score: -').should('exist');
      cy.assertText('Submitted');

      review.fillReview('Love it, 5 stars', 'Best talk');
      cy.assertText('Review saved.');

      cy.findByLabelText('Love it: 1').should('exist');
      cy.findByLabelText('Score: 4').should('exist');
      cy.findByLabelText('Love it: 5').should('exist');

      review.reviewsTab();
      review
        .reviewsList()
        .last()
        .within(() => {
          cy.findByText('Clark Kent').should('exist');
          cy.findByLabelText('Love it: 5').should('exist');
          cy.findByText('Best talk').should('exist');
        });
    });

    it('navigates between proposals', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      cy.assertText('2/2');
      review.nextProposal();
      review.title('Talk 2').should('exist');
      cy.assertText('1/2');
      review.nextProposal();
      review.title('Talk 1').should('exist');
      cy.assertText('2/2');
      review.previousProposal();
      review.title('Talk 2').should('exist');
      cy.assertText('1/2');
    });

    it('exits the proposal review page', () => {
      review.visit('orga-1', 'conference-1', 'proposal-1');
      review.title('Talk 1').should('exist');
      review.close();
      proposals.isPageVisible();
    });

    it.only('hides reviews, speakers, review panel following event settings', () => {
      review.visit('orga-1', 'conference-2', 'proposal-2');
      review.title('Talk 3').should('exist');

      cy.findByRole('heading', { name: 'Your review' }).should('not.exist');
      cy.findByRole('link', { name: /Speakers/ }).should('not.exist');
      cy.findByRole('link', { name: /Reviews/ }).should('not.exist');

      cy.visit(`/organizer/orga-1/conference-2/review/proposal-2/speakers`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');

      cy.visit(`/organizer/orga-1/conference-2/review/proposal-2/reviews`, { failOnStatusCode: false });
      cy.assertText('Forbidden operation');
    });
  });
});
