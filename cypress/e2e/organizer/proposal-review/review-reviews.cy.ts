import ProposalReviewPage from 'page-objects/organizer/event-proposal-review.page';

describe('Organizer ratings in proposal review page', () => {
  beforeEach(() => {
    cy.task('seedDB', 'organizer/proposal-review/proposal-review');
  });

  afterEach(() => cy.task('disconnectDB'));

  const review = new ProposalReviewPage();

  beforeEach(() => cy.login('Clark Kent'));

  it('displays organizer reviews', () => {
    review.visit('orga-1', 'conference-1', 'proposal-1');

    review.reviewsTab();

    review.reviewsList().should('have.length', 1);

    review
      .reviewsList()
      .first()
      .within(() => {
        cy.findByText('Bruce Wayne').should('exist');
        cy.findByLabelText('Score: 3').should('exist');
        cy.findByText('No comment.').should('exist');
      });
  });
});
